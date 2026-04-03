import type { AppData } from '../api/types.js';

/**
 * Generate realistic demo data for trying ASC Doctor without API keys.
 * This simulates an app with common issues that developers encounter.
 */
export function generateDemoData(): AppData {
  return {
    app: {
      type: 'apps',
      id: '1234567890',
      attributes: {
        name: 'WeatherPulse',
        bundleId: 'com.example.weatherpulse',
        sku: 'WEATHERPULSE_2024',
        primaryLocale: 'en-US',
      },
    },
    version: {
      type: 'appStoreVersions',
      id: 'ver-001',
      attributes: {
        platform: 'IOS',
        versionString: '2.4.0',
        appStoreState: 'PREPARE_FOR_SUBMISSION',
        releaseType: 'MANUAL',
        createdDate: '2026-03-28T10:00:00Z',
      },
    },
    versionLocalizations: [
      {
        type: 'appStoreVersionLocalizations',
        id: 'vloc-en',
        attributes: {
          locale: 'en-US',
          description: 'WeatherPulse gives you hyper-local weather forecasts with stunning visualizations. Track storms, check hourly conditions, and get severe weather alerts — all in a beautifully designed interface.',
          keywords: 'weather,forecast,rain,storm,temperature,wind,humidity,radar',
          promotionalText: 'Now with real-time lightning tracking! ⚡',
          whatsNew: 'Bug fixes and performance improvements.',
          marketingUrl: 'https://weatherpulse.app',
          supportUrl: 'https://weatherpulse.app/support',
        },
      },
      {
        type: 'appStoreVersionLocalizations',
        id: 'vloc-de',
        attributes: {
          locale: 'de-DE',
          description: '', // ← Empty description!
          keywords: '',    // ← Empty keywords!
          promotionalText: null,
          whatsNew: null,
          marketingUrl: null,
          supportUrl: null,
        },
      },
      {
        type: 'appStoreVersionLocalizations',
        id: 'vloc-ja',
        attributes: {
          locale: 'ja',
          description: 'TODO: Add Japanese description here', // ← Placeholder!
          keywords: 'weather,forecast,app,free,weather', // 'app', 'free' are weak; 'weather' is duplicate
          promotionalText: null,
          whatsNew: null,
          marketingUrl: null,
          supportUrl: null,
        },
      },
      {
        type: 'appStoreVersionLocalizations',
        id: 'vloc-fr',
        attributes: {
          locale: 'fr-FR',
          description: 'WeatherPulse vous offre des prévisions météo hyper-locales avec des visualisations époustouflantes.',
          keywords: 'météo,prévisions,pluie,tempête,température',
          promotionalText: null,
          whatsNew: null,
          marketingUrl: null,
          supportUrl: null,
        },
      },
    ],
    appInfo: {
      type: 'appInfos',
      id: 'info-001',
      attributes: {
        appStoreState: 'READY_FOR_DISTRIBUTION',
      },
    },
    appInfoLocalizations: [
      {
        type: 'appInfoLocalizations',
        id: 'iloc-en',
        attributes: {
          locale: 'en-US',
          name: 'WeatherPulse',
          subtitle: 'Best Weather App', // ← Generic subtitle!
          privacyPolicyUrl: 'https://weatherpulse.app/privacy',
          privacyChoicesUrl: null,
          privacyPolicyText: null,
        },
      },
      {
        type: 'appInfoLocalizations',
        id: 'iloc-de',
        attributes: {
          locale: 'de-DE',
          name: 'WeatherPulse',
          subtitle: null, // ← Missing subtitle!
          privacyPolicyUrl: 'https://weatherpulse.app/privacy', 
          privacyChoicesUrl: null,
          privacyPolicyText: null,
        },
      },
      {
        type: 'appInfoLocalizations',
        id: 'iloc-ja',
        attributes: {
          locale: 'ja',
          name: 'WeatherPulse',
          subtitle: 'WP', // ← Too short!
          privacyPolicyUrl: null, // ← Missing privacy policy!
          privacyChoicesUrl: null,
          privacyPolicyText: null,
        },
      },
      {
        type: 'appInfoLocalizations',
        id: 'iloc-fr',
        attributes: {
          locale: 'fr-FR',
          name: 'WeatherPulse',
          subtitle: 'Météo en temps réel',
          privacyPolicyUrl: 'http://weatherpulse.app/privacy-fr', // ← HTTP, not HTTPS!
          privacyChoicesUrl: null,
          privacyPolicyText: null,
        },
      },
      {
        type: 'appInfoLocalizations',
        id: 'iloc-ko',
        attributes: {
          locale: 'ko',
          name: 'WeatherPulse',
          subtitle: null,
          privacyPolicyUrl: 'https://weatherpulse.app/privacy',
          privacyChoicesUrl: null,
          privacyPolicyText: null,
        },
      },
    ],
    ageRatingDeclaration: {
      type: 'ageRatingDeclarations',
      id: 'age-001',
      attributes: {
        alcoholTobaccoOrDrugUseOrReferences: 'NONE',
        contests: 'NONE',
        gamblingAndContests: false,
        gambling: false,
        gamblingSimulated: 'NONE',
        horrorOrFearThemes: 'NONE',
        matureOrSuggestiveThemes: 'NONE',
        medicalOrTreatmentInformation: 'NONE',
        profanityOrCrudeHumor: 'NONE',
        sexualContentGraphicAndNudity: 'NONE',
        sexualContentOrNudity: 'NONE',
        violenceCartoonOrFantasy: 'NONE',
        violenceRealistic: 'NONE',
        violenceRealisticProlongedGraphicOrSadistic: 'NONE',
        kidsAgeBand: null,
        unrestrictedWebAccess: false,
        seventeenPlus: false,
      },
    },
    screenshotSets: [
      // en-US: Has iPhone 6.7" with 5 screenshots ✓
      {
        type: 'appScreenshotSets',
        id: 'ss-en-67',
        attributes: { screenshotDisplayType: 'APP_IPHONE_67' },
        screenshotCount: 5,
        locale: 'en-US',
        screenshots: [
          { type: 'appScreenshots', id: 'img1', attributes: { fileSize: 100, fileName: '1.png', sourceFileChecksum: 'abc123hash', assetDeliveryState: { state: 'COMPLETE', errors: [] } } },
          { type: 'appScreenshots', id: 'img2', attributes: { fileSize: 100, fileName: '2.png', sourceFileChecksum: 'abc123hash', assetDeliveryState: { state: 'COMPLETE', errors: [] } } }, // Duplicate!
        ] as any,
      },
      // en-US: Has iPad 12.9" with 3 screenshots ✓
      {
        type: 'appScreenshotSets',
        id: 'ss-en-ipad',
        attributes: { screenshotDisplayType: 'APP_IPAD_PRO_3GEN_129' },
        screenshotCount: 3,
        locale: 'en-US',
        screenshots: [],
      },
      // de-DE: Has iPad 9.7" but no required 13" iPad
      {
        type: 'appScreenshotSets',
        id: 'ss-de-ipad97',
        attributes: { screenshotDisplayType: 'APP_IPAD_97' },
        screenshotCount: 3,
        locale: 'de-DE',
        screenshots: [],
      },
      // de-DE: iPhone set exists but EMPTY!
      {
        type: 'appScreenshotSets',
        id: 'ss-de-67',
        attributes: { screenshotDisplayType: 'APP_IPHONE_67' },
        screenshotCount: 0, // ← Empty!
        locale: 'de-DE',
        screenshots: [],
      },
      // ja: Only 1 screenshot (too few)
      {
        type: 'appScreenshotSets',
        id: 'ss-ja-67',
        attributes: { screenshotDisplayType: 'APP_IPHONE_67' },
        screenshotCount: 1, // ← Too few
        locale: 'ja',
        screenshots: [],
      },
      // fr-FR: No screenshots at all — not in the array!
    ],
    subscriptionGroups: [
      {
        type: 'subscriptionGroups',
        id: 'sg-001',
        attributes: { referenceName: 'WeatherPulse Pro' },
      },
    ],
    subscriptions: [
      {
        type: 'subscriptions',
        id: 'sub-001',
        attributes: {
          name: 'Monthly Pro',
          productId: 'com.example.weatherpulse.pro.monthly',
          state: 'APPROVED',
          subscriptionPeriod: 'ONE_MONTH',
          reviewNote: null,
          groupLevel: 1,
        },
        localizations: [
          {
            type: 'subscriptionLocalizations',
            id: 'subloc-en',
            attributes: {
              locale: 'en-US',
              name: 'WeatherPulse Pro Monthly',
              description: 'Unlock all pro features with monthly billing. Try it free for 7 days!', // Will trigger SUBS-009 since no 'cancel' or 'renew'
              state: 'APPROVED',
            },
          },
          {
            type: 'subscriptionLocalizations',
            id: 'subloc-de',
            attributes: {
              locale: 'de-DE',
              name: '', // ← Empty name!
              description: '', // ← Empty description!
              state: 'APPROVED',
            },
          },
          // ja is missing entirely!
          // fr-FR is missing entirely!
        ],
      },
    ],
    subscriptionGroupLocalizations: [
      {
        groupId: 'sg-001',
        localizations: [
          {
            type: 'subscriptionGroupLocalizations',
            id: 'sgloc-en',
            attributes: {
              locale: 'en-US',
              name: 'WeatherPulse Pro',
              customAppName: null,
              state: 'APPROVED',
            },
          },
          // de-DE, ja, fr-FR group localizations missing!
        ],
      },
    ],
    inAppPurchases: [
      {
        type: 'inAppPurchases',
        id: 'iap-001',
        attributes: {
          name: 'Radar Themes Pack',
          productId: 'com.example.weatherpulse.themes',
          inAppPurchaseType: 'NON_CONSUMABLE',
          state: 'APPROVED',
          reviewNote: null,
        },
        localizations: [
          {
            type: 'inAppPurchaseLocalizations',
            id: 'iaploc-en',
            attributes: {
              locale: 'en-US',
              name: 'Radar Themes Pack',
              description: 'Beautiful custom themes for the radar view.',
              state: 'APPROVED',
            },
          },
        ],
      },
    ],
    reviewDetail: {
      type: 'appStoreReviewDetails',
      id: 'rev-001',
      attributes: {
        contactFirstName: 'John',
        contactLastName: 'Doe',
        contactPhone: null, // ← No phone
        contactEmail: 'john@weatherpulse.app',
        demoAccountName: null,
        demoAccountPassword: null,
        demoAccountRequired: false,
        notes: '', // ← Empty notes
      },
    },
    availableTerritories: [
      { type: 'territories', id: 'USA', attributes: { currency: 'USD' } },
      { type: 'territories', id: 'GBR', attributes: { currency: 'GBP' } },
      { type: 'territories', id: 'DEU', attributes: { currency: 'EUR' } },
      { type: 'territories', id: 'FRA', attributes: { currency: 'EUR' } },
      { type: 'territories', id: 'CAN', attributes: { currency: 'CAD' } },
      { type: 'territories', id: 'AUS', attributes: { currency: 'AUD' } },
      // Missing: JPN, CHN, KOR, BRA, IND, ITA, ESP, NLD, TUR
    ],
  };
}
