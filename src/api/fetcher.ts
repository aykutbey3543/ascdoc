import { APIClient } from './client.js';
import type {
  App,
  AppStoreVersion,
  VersionLocalization,
  AppInfo,
  AppInfoLocalization,
  AgeRatingDeclaration,
  ScreenshotSet,
  Screenshot,
  SubscriptionGroup,
  Subscription,
  SubscriptionLocalization,
  SubscriptionGroupLocalization,
  InAppPurchase,
  InAppPurchaseLocalization,
  Territory,
  ReviewDetail,
  AppData,
} from './types.js';

export async function fetchAppData(client: APIClient, appId?: string): Promise<AppData> {
  // 1. Get app (auto-select if no appId provided)
  const app = await resolveApp(client, appId);

  // 2. Get latest version
  const version = await getLatestVersion(client, app.id);

  // 3. Fetch all data in parallel where possible
  const [
    versionLocalizations,
    appInfoResult,
    screenshotSets,
    reviewDetail,
  ] = await Promise.all([
    getVersionLocalizations(client, version.id),
    getAppInfo(client, app.id),
    getScreenshotSets(client, version.id),
    getReviewDetail(client, version.id),
  ]);

  const { appInfo, appInfoLocalizations, ageRatingDeclaration } = appInfoResult;

  // 4. Fetch subscription & IAP data
  const [subscriptionData, iapData, territories] = await Promise.all([
    getSubscriptionData(client, app.id),
    getIAPData(client, app.id),
    getTerritories(client, app.id),
  ]);

  return {
    app,
    version,
    versionLocalizations,
    appInfo,
    appInfoLocalizations,
    ageRatingDeclaration,
    screenshotSets,
    ...subscriptionData,
    inAppPurchases: iapData,
    reviewDetail,
    availableTerritories: territories,
  };
}

async function resolveApp(client: APIClient, appId?: string): Promise<App> {
  if (appId) {
    const response = await client.request<App>(`/v1/apps/${appId}`);
    return response.data;
  }

  // List all apps and let user know if multiple
  const apps = await client.paginate<App>('/v1/apps');
  if (apps.length === 0) {
    throw new Error('No apps found in your App Store Connect account.');
  }
  if (apps.length === 1) {
    return apps[0];
  }

  // Multiple apps — list them and ask for --app-id
  const appList = apps
    .map((a) => `  • ${a.attributes.name} (${a.attributes.bundleId}) → --app-id ${a.id}`)
    .join('\n');
  throw new Error(
    `Multiple apps found. Please specify --app-id:\n\n${appList}`,
  );
}

async function getLatestVersion(client: APIClient, appId: string): Promise<AppStoreVersion> {
  const versions = await client.paginate<AppStoreVersion>(
    `/v1/apps/${appId}/appStoreVersions`,
    {
      'filter[platform]': 'IOS',
      'sort': '-createdDate',
      'limit': '5',
    },
  );

  if (versions.length === 0) {
    throw new Error('No App Store versions found for this app.');
  }

  // Prefer editable versions (PREPARE_FOR_SUBMISSION, DEVELOPER_REJECTED, etc.)
  const editableStates = [
    'PREPARE_FOR_SUBMISSION',
    'DEVELOPER_REJECTED',
    'REJECTED',
    'METADATA_REJECTED',
    'INVALID_BINARY',
  ];

  const editable = versions.find((v) => editableStates.includes(v.attributes.appStoreState));
  return editable || versions[0];
}

async function getVersionLocalizations(
  client: APIClient,
  versionId: string,
): Promise<VersionLocalization[]> {
  return client.paginate<VersionLocalization>(
    `/v1/appStoreVersions/${versionId}/appStoreVersionLocalizations`,
  );
}

async function getAppInfo(
  client: APIClient,
  appId: string,
): Promise<{
  appInfo: AppInfo;
  appInfoLocalizations: AppInfoLocalization[];
  ageRatingDeclaration: AgeRatingDeclaration | null;
}> {
  const appInfos = await client.paginate<AppInfo>(`/v1/apps/${appId}/appInfos`);

  if (appInfos.length === 0) {
    throw new Error('No app info found.');
  }

  // Get the latest (first) app info
  const appInfo = appInfos[0];

  const [localizations, ageRating] = await Promise.all([
    client.paginate<AppInfoLocalization>(
      `/v1/appInfos/${appInfo.id}/appInfoLocalizations`,
    ),
    getAgeRatingDeclaration(client, appInfo.id),
  ]);

  return {
    appInfo,
    appInfoLocalizations: localizations,
    ageRatingDeclaration: ageRating,
  };
}

async function getAgeRatingDeclaration(
  client: APIClient,
  appInfoId: string,
): Promise<AgeRatingDeclaration | null> {
  try {
    const response = await client.request<AgeRatingDeclaration>(
      `/v1/appInfos/${appInfoId}/ageRatingDeclaration`,
    );
    return response.data;
  } catch {
    return null;
  }
}

async function getScreenshotSets(
  client: APIClient,
  versionId: string,
): Promise<Array<ScreenshotSet & { screenshotCount: number; locale: string; screenshots: Screenshot[] }>> {
  // Get version localizations to know the locale for each set
  const localizations = await client.paginate<VersionLocalization>(
    `/v1/appStoreVersions/${versionId}/appStoreVersionLocalizations`,
  );

  const allSets: Array<ScreenshotSet & { screenshotCount: number; locale: string; screenshots: Screenshot[] }> = [];

  for (const loc of localizations) {
    const sets = await client.paginate<ScreenshotSet>(
      `/v1/appStoreVersionLocalizations/${loc.id}/appScreenshotSets`,
    );

    for (const set of sets) {
      // Get screenshot count
      const screenshots = await client.paginate<Screenshot>(
        `/v1/appScreenshotSets/${set.id}/appScreenshots`,
      );

      allSets.push({
        ...set,
        screenshotCount: screenshots.length,
        locale: loc.attributes.locale,
        screenshots,
      });
    }
  }

  return allSets;
}

async function getReviewDetail(
  client: APIClient,
  versionId: string,
): Promise<ReviewDetail | null> {
  try {
    const response = await client.request<ReviewDetail>(
      `/v1/appStoreVersions/${versionId}/appStoreReviewDetail`,
    );
    return response.data;
  } catch {
    return null;
  }
}

async function getSubscriptionData(
  client: APIClient,
  appId: string,
): Promise<{
  subscriptionGroups: SubscriptionGroup[];
  subscriptions: Array<Subscription & { localizations: SubscriptionLocalization[] }>;
  subscriptionGroupLocalizations: Array<{ groupId: string; localizations: SubscriptionGroupLocalization[] }>;
}> {
  try {
    const groups = await client.paginate<SubscriptionGroup>(
      `/v1/apps/${appId}/subscriptionGroups`,
    );

    const subscriptions: Array<Subscription & { localizations: SubscriptionLocalization[] }> = [];
    const groupLocalizations: Array<{ groupId: string; localizations: SubscriptionGroupLocalization[] }> = [];

    for (const group of groups) {
      // Get subscriptions in this group
      const subs = await client.paginate<Subscription>(
        `/v1/subscriptionGroups/${group.id}/subscriptions`,
      );

      for (const sub of subs) {
        const locs = await client.paginate<SubscriptionLocalization>(
          `/v1/subscriptions/${sub.id}/subscriptionLocalizations`,
        );
        subscriptions.push({ ...sub, localizations: locs });
      }

      // Get group localizations
      const gLocs = await client.paginate<SubscriptionGroupLocalization>(
        `/v1/subscriptionGroups/${group.id}/subscriptionGroupLocalizations`,
      );
      groupLocalizations.push({ groupId: group.id, localizations: gLocs });
    }

    return {
      subscriptionGroups: groups,
      subscriptions,
      subscriptionGroupLocalizations: groupLocalizations,
    };
  } catch {
    return {
      subscriptionGroups: [],
      subscriptions: [],
      subscriptionGroupLocalizations: [],
    };
  }
}

async function getIAPData(
  client: APIClient,
  appId: string,
): Promise<Array<InAppPurchase & { localizations: InAppPurchaseLocalization[] }>> {
  try {
    const iaps = await client.paginate<InAppPurchase>(
      `/v2/apps/${appId}/inAppPurchasesV2`,
    );

    const enriched: Array<InAppPurchase & { localizations: InAppPurchaseLocalization[] }> = [];

    for (const iap of iaps) {
      const locs = await client.paginate<InAppPurchaseLocalization>(
        `/v2/inAppPurchases/${iap.id}/inAppPurchaseLocalizations`,
      );
      enriched.push({ ...iap, localizations: locs });
    }

    return enriched;
  } catch {
    return [];
  }
}

async function getTerritories(
  client: APIClient,
  appId: string,
): Promise<Territory[]> {
  try {
    return await client.paginate<Territory>(
      `/v1/apps/${appId}/availableTerritories`,
    );
  } catch {
    return [];
  }
}
