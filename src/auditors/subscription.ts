import type { AppData } from '../api/types.js';
import type { AuditResult, Finding } from './types.js';

export function auditSubscriptions(data: AppData): AuditResult {
  const start = Date.now();
  const findings: Finding[] = [];

  // Get the set of locales the app supports
  const appLocales = new Set(data.versionLocalizations.map((l) => l.attributes.locale));

  // ─── Subscription Group Checks ────────────────────────────────────

  for (const groupLocData of data.subscriptionGroupLocalizations) {
    const { groupId, localizations } = groupLocData;
    const group = data.subscriptionGroups.find((g) => g.id === groupId);
    const groupName = group?.attributes.referenceName || groupId;
    const groupLocales = new Set(localizations.map((l) => l.attributes.locale));

    // SUBS-001: Group missing localization for a supported locale
    for (const locale of appLocales) {
      if (!groupLocales.has(locale)) {
        findings.push({
          id: 'SUBS-001',
          module: 'subscription',
          severity: 'high',
          title: `Subscription group "${groupName}" missing \`${locale}\` localization`,
          message: `The subscription group "${groupName}" has no display name for ${locale}. This can cause "Missing Metadata" states for subscriptions in this group.`,
          locale,
          remedy: `Add a display name for ${locale} under the subscription group "${groupName}" in App Store Connect.`,
        });
      }
    }

    // SUBS-002: Group localization with empty name
    for (const loc of localizations) {
      if (!loc.attributes.name || loc.attributes.name.trim().length === 0) {
        findings.push({
          id: 'SUBS-002',
          module: 'subscription',
          severity: 'high',
          title: `Subscription group "${groupName}" has empty name for \`${loc.attributes.locale}\``,
          message: `The display name for subscription group "${groupName}" in ${loc.attributes.locale} is empty.`,
          locale: loc.attributes.locale,
          remedy: `Set a display name for the subscription group "${groupName}" in ${loc.attributes.locale}.`,
        });
      }
    }
  }

  // ─── Individual Subscription Checks ───────────────────────────────

  for (const sub of data.subscriptions) {
    const subName = sub.attributes.name || sub.attributes.productId;
    const subLocales = new Set(sub.localizations.map((l) => l.attributes.locale));

    // SUBS-003: Subscription missing localized display name
    for (const loc of sub.localizations) {
      if (!loc.attributes.name || loc.attributes.name.trim().length === 0) {
        findings.push({
          id: 'SUBS-003',
          module: 'subscription',
          severity: 'critical',
          title: `Subscription "${subName}" missing display name for \`${loc.attributes.locale}\``,
          message: `The subscription "${subName}" has no localized display name for ${loc.attributes.locale}. This is required for the subscription sheet.`,
          locale: loc.attributes.locale,
          remedy: `Add a display name for "${subName}" in ${loc.attributes.locale}.`,
        });
      }
    }

    // SUBS-004: Subscription missing localized description
    for (const loc of sub.localizations) {
      if (!loc.attributes.description || loc.attributes.description.trim().length === 0) {
        findings.push({
          id: 'SUBS-004',
          module: 'subscription',
          severity: 'critical',
          title: `Subscription "${subName}" missing description for \`${loc.attributes.locale}\``,
          message: `The subscription "${subName}" has no localized description for ${loc.attributes.locale}. This is required for App Store display.`,
          locale: loc.attributes.locale,
          remedy: `Add a description for "${subName}" in ${loc.attributes.locale}.`,
        });
      }
    }

    // SUBS-005: Subscription not localized for a supported app locale
    for (const locale of appLocales) {
      if (!subLocales.has(locale)) {
        findings.push({
          id: 'SUBS-005',
          module: 'subscription',
          severity: 'high',
          title: `Subscription "${subName}" missing \`${locale}\` localization`,
          message: `Your app supports ${locale} but the subscription "${subName}" has no localization for it.`,
          locale,
          remedy: `Add localized metadata for "${subName}" in ${locale}.`,
        });
      }
    }

    // SUBS-009: Trial messaging without auto-renew terms
    for (const loc of sub.localizations) {
      if (loc.attributes.description) {
        const desc = loc.attributes.description.toLowerCase();
        const mentionsTrial = desc.includes('trial') || desc.includes('free') || desc.includes('gratis') || desc.includes('essai');
        const mentionsTerms = desc.includes('cancel') || desc.includes('renew') || desc.includes('payment') || desc.includes('charge') || desc.includes('pay') || desc.includes('renouvellement');
        
        if (mentionsTrial && !mentionsTerms) {
          findings.push({
            id: 'SUBS-009',
            module: 'subscription',
            severity: 'high',
            title: `Missing billing terms in description for \`${loc.attributes.locale}\``,
            message: `The subscription "${subName}" mentions a "trial" or "free" period but does not explain auto-renewal or cancellation terms.`,
            locale: loc.attributes.locale,
            remedy: `Add text explaining that the subscription auto-renews. Example: "Subscription automatically renews unless auto-renew is turned off at least 24-hours before the end of the current period. Account will be charged for renewal within 24-hours prior to the end of the current period."`,
          });
        }
      }
    }
  }

  // ─── In-App Purchase Checks ───────────────────────────────────────

  for (const iap of data.inAppPurchases) {
    const iapName = iap.attributes.name || iap.attributes.productId;
    const iapLocales = new Set(iap.localizations.map((l) => l.attributes.locale));

    // SUBS-006: IAP missing localized display name
    for (const loc of iap.localizations) {
      if (!loc.attributes.name || loc.attributes.name.trim().length === 0) {
        findings.push({
          id: 'SUBS-006',
          module: 'subscription',
          severity: 'critical',
          title: `IAP "${iapName}" missing display name for \`${loc.attributes.locale}\``,
          message: `The in-app purchase "${iapName}" has no localized display name for ${loc.attributes.locale}.`,
          locale: loc.attributes.locale,
          remedy: `Add a display name for "${iapName}" in ${loc.attributes.locale}.`,
        });
      }
    }

    // SUBS-007: IAP missing localized description
    for (const loc of iap.localizations) {
      if (!loc.attributes.description || loc.attributes.description.trim().length === 0) {
        findings.push({
          id: 'SUBS-007',
          module: 'subscription',
          severity: 'warning',
          title: `IAP "${iapName}" missing description for \`${loc.attributes.locale}\``,
          message: `The in-app purchase "${iapName}" has no localized description for ${loc.attributes.locale}.`,
          locale: loc.attributes.locale,
          remedy: `Add a description for "${iapName}" in ${loc.attributes.locale}.`,
        });
      }
    }

    // SUBS-008: IAP not localized for supported app locale
    for (const locale of appLocales) {
      if (!iapLocales.has(locale)) {
        findings.push({
          id: 'SUBS-008',
          module: 'subscription',
          severity: 'high',
          title: `IAP "${iapName}" missing \`${locale}\` localization`,
          message: `Your app supports ${locale} but the IAP "${iapName}" has no localization for it.`,
          locale,
          remedy: `Add localized metadata for "${iapName}" in ${locale}.`,
        });
      }
    }
  }

  return {
    module: 'subscription',
    label: 'Subscriptions & IAP',
    icon: '💳',
    findings,
    duration: Date.now() - start,
  };
}
