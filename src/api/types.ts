// ─── Shared ASC API Types ───────────────────────────────────────────

export interface ASCResource<T extends string, A = Record<string, unknown>> {
  type: T;
  id: string;
  attributes: A;
  relationships?: Record<string, { data: { type: string; id: string } | { type: string; id: string }[] | null; links?: { related: string } }>;
  links?: { self: string };
}

// ─── App ────────────────────────────────────────────────────────────

export interface AppAttributes {
  name: string;
  bundleId: string;
  sku: string;
  primaryLocale: string;
  contentRightsDeclaration?: string;
}

export type App = ASCResource<'apps', AppAttributes>;

// ─── App Store Version ──────────────────────────────────────────────

export interface AppStoreVersionAttributes {
  platform: 'IOS' | 'MAC_OS' | 'TV_OS' | 'VISION_OS';
  versionString: string;
  appStoreState: string;
  releaseType: string;
  createdDate: string;
}

export type AppStoreVersion = ASCResource<'appStoreVersions', AppStoreVersionAttributes>;

// ─── App Store Version Localization ─────────────────────────────────

export interface VersionLocalizationAttributes {
  locale: string;
  description: string | null;
  keywords: string | null;
  promotionalText: string | null;
  whatsNew: string | null;
  marketingUrl: string | null;
  supportUrl: string | null;
}

export type VersionLocalization = ASCResource<'appStoreVersionLocalizations', VersionLocalizationAttributes>;

// ─── App Info ───────────────────────────────────────────────────────

export interface AppInfoAttributes {
  appStoreState: string;
  appStoreAgeRating?: string;
  brazilAgeRating?: string;
  kidsAgeBand?: string | null;
}

export type AppInfo = ASCResource<'appInfos', AppInfoAttributes>;

// ─── App Info Localization ──────────────────────────────────────────

export interface AppInfoLocalizationAttributes {
  locale: string;
  name: string | null;
  subtitle: string | null;
  privacyPolicyUrl: string | null;
  privacyChoicesUrl: string | null;
  privacyPolicyText: string | null;
}

export type AppInfoLocalization = ASCResource<'appInfoLocalizations', AppInfoLocalizationAttributes>;

// ─── Age Rating Declaration ─────────────────────────────────────────

export interface AgeRatingDeclarationAttributes {
  alcoholTobaccoOrDrugUseOrReferences: string | null;
  contests: string | null;
  gamblingAndContests: boolean | null;
  gambling: boolean | null;
  gamblingSimulated: string | null;
  horrorOrFearThemes: string | null;
  matureOrSuggestiveThemes: string | null;
  medicalOrTreatmentInformation: string | null;
  profanityOrCrudeHumor: string | null;
  sexualContentGraphicAndNudity: string | null;
  sexualContentOrNudity: string | null;
  violenceCartoonOrFantasy: string | null;
  violenceRealistic: string | null;
  violenceRealisticProlongedGraphicOrSadistic: string | null;
  kidsAgeBand: string | null;
  unrestrictedWebAccess: boolean | null;
  seventeenPlus: boolean | null;
}

export type AgeRatingDeclaration = ASCResource<'ageRatingDeclarations', AgeRatingDeclarationAttributes>;

// ─── Screenshot Set ─────────────────────────────────────────────────

export interface ScreenshotSetAttributes {
  screenshotDisplayType: string;
}

export type ScreenshotSet = ASCResource<'appScreenshotSets', ScreenshotSetAttributes>;

// ─── Screenshot ─────────────────────────────────────────────────────

export interface ScreenshotAttributes {
  fileSize: number;
  fileName: string;
  sourceFileChecksum: string | null;
  assetDeliveryState: {
    state: string;
    errors: unknown[];
  };
}

export type Screenshot = ASCResource<'appScreenshots', ScreenshotAttributes>;

// ─── Subscription Group ─────────────────────────────────────────────

export interface SubscriptionGroupAttributes {
  referenceName: string;
}

export type SubscriptionGroup = ASCResource<'subscriptionGroups', SubscriptionGroupAttributes>;

// ─── Subscription ───────────────────────────────────────────────────

export interface SubscriptionAttributes {
  name: string;
  productId: string;
  state: string;
  subscriptionPeriod: string;
  reviewNote: string | null;
  groupLevel: number;
}

export type Subscription = ASCResource<'subscriptions', SubscriptionAttributes>;

// ─── Subscription Localization ──────────────────────────────────────

export interface SubscriptionLocalizationAttributes {
  locale: string;
  name: string | null;
  description: string | null;
  state: string;
}

export type SubscriptionLocalization = ASCResource<'subscriptionLocalizations', SubscriptionLocalizationAttributes>;

// ─── Subscription Group Localization ────────────────────────────────

export interface SubscriptionGroupLocalizationAttributes {
  locale: string;
  name: string | null;
  customAppName: string | null;
  state: string;
}

export type SubscriptionGroupLocalization = ASCResource<'subscriptionGroupLocalizations', SubscriptionGroupLocalizationAttributes>;

// ─── In-App Purchase ────────────────────────────────────────────────

export interface InAppPurchaseAttributes {
  name: string;
  productId: string;
  inAppPurchaseType: string;
  state: string;
  reviewNote: string | null;
}

export type InAppPurchase = ASCResource<'inAppPurchases', InAppPurchaseAttributes>;

// ─── In-App Purchase Localization ───────────────────────────────────

export interface InAppPurchaseLocalizationAttributes {
  locale: string;
  name: string | null;
  description: string | null;
  state: string;
}

export type InAppPurchaseLocalization = ASCResource<'inAppPurchaseLocalizations', InAppPurchaseLocalizationAttributes>;

// ─── Territory ──────────────────────────────────────────────────────

export interface TerritoryAttributes {
  currency: string;
}

export type Territory = ASCResource<'territories', TerritoryAttributes>;

// ─── App Store Review Detail ────────────────────────────────────────

export interface ReviewDetailAttributes {
  contactFirstName: string | null;
  contactLastName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  demoAccountName: string | null;
  demoAccountPassword: string | null;
  demoAccountRequired: boolean | null;
  notes: string | null;
}

export type ReviewDetail = ASCResource<'appStoreReviewDetails', ReviewDetailAttributes>;

// ─── Aggregated App Data (passed to auditors) ───────────────────────

export interface AppData {
  app: App;
  version: AppStoreVersion;
  versionLocalizations: VersionLocalization[];
  appInfo: AppInfo;
  appInfoLocalizations: AppInfoLocalization[];
  ageRatingDeclaration: AgeRatingDeclaration | null;
  screenshotSets: Array<ScreenshotSet & { screenshotCount: number; locale: string; screenshots: Screenshot[] }>;
  subscriptionGroups: SubscriptionGroup[];
  subscriptions: Array<Subscription & { localizations: SubscriptionLocalization[] }>;
  subscriptionGroupLocalizations: Array<{ groupId: string; localizations: SubscriptionGroupLocalization[] }>;
  inAppPurchases: Array<InAppPurchase & { localizations: InAppPurchaseLocalization[] }>;
  reviewDetail: ReviewDetail | null;
  availableTerritories: Territory[];
}
