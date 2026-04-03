import type { AppData } from '../api/types.js';
import type { AuditResult, Finding } from './types.js';

// Required screenshot display types for submission
const REQUIRED_IPHONE_TYPES = [
  'APP_IPHONE_67',    // 6.7" (iPhone 15 Pro Max, 16 Plus)
  'APP_IPHONE_69',    // 6.9" (iPhone 16 Pro Max) — newest
];

// iPad types for validation (If iPad screenshots exist, one of these is required)
const REQUIRED_IPAD_TYPES = [
  'APP_IPAD_PRO_3GEN_129',
  'APP_IPAD_PRO_129',
  'APP_IPAD_13',
];

const DEVICE_TYPE_LABELS: Record<string, string> = {
  'APP_IPHONE_35': 'iPhone 3.5"',
  'APP_IPHONE_40': 'iPhone 4.0"',
  'APP_IPHONE_47': 'iPhone 4.7"',
  'APP_IPHONE_55': 'iPhone 5.5"',
  'APP_IPHONE_58': 'iPhone 5.8"',
  'APP_IPHONE_61': 'iPhone 6.1"',
  'APP_IPHONE_65': 'iPhone 6.5"',
  'APP_IPHONE_67': 'iPhone 6.7"',
  'APP_IPHONE_69': 'iPhone 6.9"',
  'APP_IPAD_97': 'iPad 9.7"',
  'APP_IPAD_105': 'iPad 10.5"',
  'APP_IPAD_PRO_3GEN_11': 'iPad Pro 11"',
  'APP_IPAD_PRO_3GEN_129': 'iPad Pro 12.9"',
  'APP_IPAD_PRO_129': 'iPad Pro 12.9"',
  'APP_IPAD_13': 'iPad 13"',
  'APP_APPLE_TV': 'Apple TV',
  'APP_WATCH_ULTRA': 'Apple Watch Ultra',
  'APP_WATCH_SERIES_7': 'Apple Watch Series 7+',
  'APP_WATCH_SERIES_4': 'Apple Watch Series 4-6',
  'APP_DESKTOP': 'Mac Desktop',
};

export function auditScreenshots(data: AppData): AuditResult {
  const start = Date.now();
  const findings: Finding[] = [];
  const platform = data.version.attributes.platform;

  // Group screenshot sets by locale
  const setsByLocale = new Map<string, typeof data.screenshotSets>();
  for (const set of data.screenshotSets) {
    const locale = set.locale;
    if (!setsByLocale.has(locale)) {
      setsByLocale.set(locale, []);
    }
    setsByLocale.get(locale)!.push(set);
  }

  // Check locales that have version localizations but no screenshot sets at all
  for (const loc of data.versionLocalizations) {
    const locale = loc.attributes.locale;
    const sets = setsByLocale.get(locale);

    // SCR-001: No screenshots at all for a locale
    if (!sets || sets.length === 0) {
      findings.push({
        id: 'SCR-001',
        module: 'screenshots',
        severity: 'critical',
        title: `No screenshots for locale \`${locale}\``,
        message: `The ${locale} localization has no screenshot sets. At least one set with screenshots is required for submission.`,
        locale,
        remedy: `Upload screenshots for ${locale} in App Store Connect > App Store > Version > Media.`,
      });
      continue;
    }

    const deviceTypes = sets.map((s) => s.attributes.screenshotDisplayType);

    // SCR-002: Missing required iPhone device type
    if (platform === 'IOS') {
      const hasRequiredIPhone = REQUIRED_IPHONE_TYPES.some((t) => deviceTypes.includes(t));
      if (!hasRequiredIPhone) {
        findings.push({
          id: 'SCR-002',
          module: 'screenshots',
          severity: 'critical',
          title: `Missing required iPhone screenshots for \`${locale}\``,
          message: `No 6.7" or 6.9" iPhone screenshots found for ${locale}. Apple requires screenshots for the largest iPhone display.`,
          locale,
          remedy: `Upload 6.9" (1320×2868) or 6.7" (1290×2796) iPhone screenshots for ${locale}.`,
        });
      }
    }

    // SCR-003: Empty screenshot set
    for (const set of sets) {
      if (set.screenshotCount === 0) {
        const deviceLabel = DEVICE_TYPE_LABELS[set.attributes.screenshotDisplayType] || set.attributes.screenshotDisplayType;
        findings.push({
          id: 'SCR-003',
          module: 'screenshots',
          severity: 'high',
          title: `Empty screenshot set for ${deviceLabel} in \`${locale}\``,
          message: `A screenshot set exists for ${deviceLabel} (${locale}) but contains 0 screenshots. Either upload screenshots or remove the empty set.`,
          locale,
          remedy: `Upload screenshots to the ${deviceLabel} set for ${locale}, or delete the empty set.`,
        });
      }
    }

    // SCR-004: Under minimum count (fewer than 3 screenshots per set)
    for (const set of sets) {
      if (set.screenshotCount > 0 && set.screenshotCount < 3) {
        const deviceLabel = DEVICE_TYPE_LABELS[set.attributes.screenshotDisplayType] || set.attributes.screenshotDisplayType;
        findings.push({
          id: 'SCR-004',
          module: 'screenshots',
          severity: 'warning',
          title: `Few screenshots for ${deviceLabel} in \`${locale}\``,
          message: `Only ${set.screenshotCount} screenshot(s) for ${deviceLabel} (${locale}). Apple allows up to 10. More screenshots improve conversion.`,
          locale,
          remedy: `Consider adding more screenshots (recommended: 5-8) for ${deviceLabel} in ${locale}.`,
        });
      }
    }

    // SCR-006: Missing required iPad screenshot if it's an iPad app
    const hasIPadScreenshots = deviceTypes.some((t) => t.startsWith('APP_IPAD_'));
    if (hasIPadScreenshots) {
      const hasRequiredIPad = REQUIRED_IPAD_TYPES.some((t) => deviceTypes.includes(t));
      if (!hasRequiredIPad) {
        findings.push({
          id: 'SCR-006',
          module: 'screenshots',
          severity: 'critical',
          title: `Missing required iPad screenshots for \`${locale}\``,
          message: `Your app has iPad screenshots, but none for the required 13" or 12.9" Pro format in ${locale}.`,
          locale,
          remedy: `Upload 13" or 12.9" iPad Pro screenshots for ${locale}.`,
        });
      }
    }

    // SCR-007: Duplicate screenshots via checksums
    for (const set of sets) {
      if (set.screenshots && set.screenshots.length > 1) {
        const checksums = new Set<string>();
        let hasDuplicates = false;
        for (const s of set.screenshots) {
          if (s.attributes.sourceFileChecksum) {
            if (checksums.has(s.attributes.sourceFileChecksum)) {
              hasDuplicates = true;
              break;
            }
            checksums.add(s.attributes.sourceFileChecksum);
          }
        }
        if (hasDuplicates) {
          const deviceLabel = DEVICE_TYPE_LABELS[set.attributes.screenshotDisplayType] || set.attributes.screenshotDisplayType;
          findings.push({
            id: 'SCR-007',
            module: 'screenshots',
            severity: 'warning',
            title: `Duplicate screenshots detected in \`${locale}\``,
            message: `Multiple screenshots in the ${deviceLabel} set have the exact same image checksum.`,
            locale,
            remedy: `Remove duplicated files and ensure all screenshots show unique functionality.`,
          });
        }
      }
    }
  }

  // SCR-005: Check if there's a locale mismatch — primary locale missing screenshots
  const primaryLocale = data.app.attributes.primaryLocale;
  if (!setsByLocale.has(primaryLocale) || setsByLocale.get(primaryLocale)!.length === 0) {
    // Only add if not already caught by SCR-001
    const alreadyCaught = findings.some(
      (f) => f.id === 'SCR-001' && f.locale === primaryLocale,
    );
    if (!alreadyCaught) {
      findings.push({
        id: 'SCR-005',
        module: 'screenshots',
        severity: 'critical',
        title: `Primary locale \`${primaryLocale}\` has no screenshots`,
        message: `Your primary locale (${primaryLocale}) is missing screenshots. This is required for submission.`,
        locale: primaryLocale,
        remedy: `Upload screenshots for your primary locale (${primaryLocale}) before submitting.`,
      });
    }
  }

  return {
    module: 'screenshots',
    label: 'Screenshots',
    icon: '📱',
    findings,
    duration: Date.now() - start,
  };
}
