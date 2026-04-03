import type { AppData } from '../api/types.js';
import type { AuditResult, Finding } from './types.js';
import { checkUrlReachability } from '../utils/url.js';

export async function auditPrivacy(data: AppData): Promise<AuditResult> {
  const start = Date.now();
  const findings: Finding[] = [];

  for (const loc of data.appInfoLocalizations) {
    const locale = loc.attributes.locale;

    // PRV-001: Missing privacy policy URL
    if (!loc.attributes.privacyPolicyUrl || loc.attributes.privacyPolicyUrl.trim().length === 0) {
      findings.push({
        id: 'PRV-001',
        module: 'privacy',
        severity: 'critical',
        title: `Missing privacy policy URL for locale \`${locale}\``,
        message: `No privacy policy URL is set for ${locale}. A valid privacy policy URL is required for all apps since October 2018.`,
        locale,
        remedy: `Add a publicly accessible privacy policy URL for ${locale} in App Store Connect > App Information.`,
      });
      continue;
    }

    const url = loc.attributes.privacyPolicyUrl.trim();

    // PRV-002: Invalid URL format
    try {
      new URL(url);
    } catch {
      findings.push({
        id: 'PRV-002',
        module: 'privacy',
        severity: 'high',
        title: `Invalid privacy policy URL for locale \`${locale}\``,
        message: `The privacy policy URL for ${locale} ("${url}") is not a valid URL format.`,
        locale,
        remedy: `Fix the privacy policy URL format for ${locale}. It should be a full URL starting with https://`,
      });
      continue;
    }

    // PRV-003: Non-HTTPS privacy URL
    if (!url.startsWith('https://')) {
      findings.push({
        id: 'PRV-003',
        module: 'privacy',
        severity: 'warning',
        title: `Privacy policy URL not HTTPS for locale \`${locale}\``,
        message: `The privacy policy URL for ${locale} uses HTTP instead of HTTPS. Apple recommends HTTPS for all URLs.`,
        locale,
        remedy: `Update the privacy policy URL for ${locale} to use HTTPS.`,
      });
    }

    // PRV-006: URL Reachability
    if (url.startsWith('http')) {
      const reachability = await checkUrlReachability(url);
      if (!reachability.reachable) {
        findings.push({
          id: 'PRV-006',
          module: 'privacy',
          severity: 'high',
          title: `Unreachable privacy policy URL for locale \`${locale}\``,
          message: `The privacy policy URL for ${locale} ("${url}") appears to be unreachable. Error: ${reachability.error}`,
          locale,
          remedy: `Ensure the URL is publicly accessible and returns a 200 OK status.`,
        });
      }
    }
  }

  // PRV-004: Check if privacy policy URLs are inconsistent across locales
  const urls = data.appInfoLocalizations
    .map((l) => l.attributes.privacyPolicyUrl?.trim())
    .filter(Boolean);

  if (urls.length > 1) {
    const uniqueUrls = new Set(urls);
    // It's fine to have different URLs per locale (translated privacy pages)
    // But flag if there are many variations as it might indicate errors
    if (uniqueUrls.size > 3 && uniqueUrls.size === urls.length) {
      findings.push({
        id: 'PRV-004',
        module: 'privacy',
        severity: 'info',
        title: 'Many unique privacy policy URLs',
        message: `Found ${uniqueUrls.size} unique privacy policy URLs across ${urls.length} localizations. Verify each is correct and accessible.`,
        remedy: 'Review all privacy policy URLs to ensure they point to valid, locale-appropriate privacy policies.',
      });
    }
  }

  // PRV-005: Privacy choices URL check
  const hasPrivacyChoicesUrl = data.appInfoLocalizations.some(
    (l) => l.attributes.privacyChoicesUrl && l.attributes.privacyChoicesUrl.trim().length > 0,
  );

  if (!hasPrivacyChoicesUrl) {
    findings.push({
      id: 'PRV-005',
      module: 'privacy',
      severity: 'info',
      title: 'No privacy choices URL configured',
      message: 'No privacy choices URL is set. This is optional but recommended if your app collects personal data and you offer data management options.',
      remedy: 'Consider adding a privacy choices URL where users can manage their data preferences.',
    });
  }

  return {
    module: 'privacy',
    label: 'Privacy',
    icon: '🔒',
    findings,
    duration: Date.now() - start,
  };
}
