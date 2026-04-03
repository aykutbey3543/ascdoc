import { describe, it, expect, vi } from 'vitest';
import { auditScreenshots } from '../../src/auditors/screenshots.js';
import { auditPrivacy } from '../../src/auditors/privacy.js';
import { auditSubtitle } from '../../src/auditors/subtitle.js';
import { auditAgeRating } from '../../src/auditors/age-rating.js';
import { auditSubscriptions } from '../../src/auditors/subscription.js';
import { auditStorefront } from '../../src/auditors/storefront.js';
import { auditReviewInfo } from '../../src/auditors/review-info.js';
import { generateDemoData } from '../../src/demo/data.js';

vi.mock('../../src/utils/url.js', () => ({
  checkUrlReachability: async () => ({ reachable: true }),
}));

describe('Screenshot Auditor', () => {
  it('detects missing screenshots for locale', () => {
    const data = generateDemoData();
    const result = auditScreenshots(data);

    const noScreenshots = result.findings.find(
      (f) => f.id === 'SCR-001' && f.locale === 'fr-FR',
    );
    expect(noScreenshots).toBeDefined();
  });

  it('detects empty screenshot sets', () => {
    const data = generateDemoData();
    const result = auditScreenshots(data);

    const emptySet = result.findings.find(
      (f) => f.id === 'SCR-003' && f.locale === 'de-DE',
    );
    expect(emptySet).toBeDefined();
  });

  it('detects low screenshot count', () => {
    const data = generateDemoData();
    const result = auditScreenshots(data);

    const fewScreenshots = result.findings.find(
      (f) => f.id === 'SCR-004' && f.locale === 'ja',
    );
    expect(fewScreenshots).toBeDefined();
  });
});

describe('Privacy Auditor', () => {
  it('detects missing privacy policy URL', async () => {
    const data = generateDemoData();
    const result = await auditPrivacy(data);

    const missingUrl = result.findings.find(
      (f) => f.id === 'PRV-001' && f.locale === 'ja',
    );
    expect(missingUrl).toBeDefined();
    expect(missingUrl?.severity).toBe('critical');
  });

  it('detects non-HTTPS privacy URL', async () => {
    const data = generateDemoData();
    const result = await auditPrivacy(data);

    const httpUrl = result.findings.find(
      (f) => f.id === 'PRV-003' && f.locale === 'fr-FR',
    );
    expect(httpUrl).toBeDefined();
  });
});

describe('Subtitle Auditor', () => {
  it('detects generic subtitle', () => {
    const data = generateDemoData();
    const result = auditSubtitle(data);

    const generic = result.findings.find(
      (f) => f.id === 'SUB-004' && f.locale === 'en-US',
    );
    expect(generic).toBeDefined();
  });

  it('detects missing subtitle', () => {
    const data = generateDemoData();
    const result = auditSubtitle(data);

    const missing = result.findings.find(
      (f) => f.id === 'SUB-001' && f.locale === 'de-DE',
    );
    expect(missing).toBeDefined();
  });

  it('detects short subtitle', () => {
    const data = generateDemoData();
    const result = auditSubtitle(data);

    const short = result.findings.find(
      (f) => f.id === 'SUB-002' && f.locale === 'ja',
    );
    expect(short).toBeDefined();
  });
});

describe('Age Rating Auditor', () => {
  it('handles valid age rating gracefully', () => {
    const data = generateDemoData();
    const result = auditAgeRating(data);

    // Demo data has all NONE so should get AGE-003 (info) only
    const critical = result.findings.filter((f) => f.severity === 'critical');
    expect(critical.length).toBe(0);
  });
});

describe('Subscription Auditor', () => {
  it('detects missing subscription localizations', () => {
    const data = generateDemoData();
    const result = auditSubscriptions(data);

    expect(result.findings.length).toBeGreaterThan(0);

    // Check for empty subscription name
    const emptyName = result.findings.find(
      (f) => f.id === 'SUBS-003' && f.locale === 'de-DE',
    );
    expect(emptyName).toBeDefined();
  });

  it('detects IAP locale gaps', () => {
    const data = generateDemoData();
    const result = auditSubscriptions(data);

    const iapGap = result.findings.filter((f) => f.id === 'SUBS-008');
    expect(iapGap.length).toBeGreaterThan(0);
  });
});

describe('Storefront Auditor', () => {
  it('detects limited territory coverage', () => {
    const data = generateDemoData();
    const result = auditStorefront(data);

    const limited = result.findings.find((f) => f.id === 'STR-002');
    expect(limited).toBeDefined();
  });

  it('detects missing major markets', () => {
    const data = generateDemoData();
    const result = auditStorefront(data);

    const missingMarkets = result.findings.find((f) => f.id === 'STR-004');
    expect(missingMarkets).toBeDefined();
  });
});

describe('Review Info Auditor', () => {
  it('detects empty review notes', () => {
    const data = generateDemoData();
    const result = auditReviewInfo(data);

    const emptyNotes = result.findings.find((f) => f.id === 'REV-007');
    expect(emptyNotes).toBeDefined();
  });

  it('detects missing phone', () => {
    const data = generateDemoData();
    const result = auditReviewInfo(data);

    const noPhone = result.findings.find((f) => f.id === 'REV-004');
    expect(noPhone).toBeDefined();
  });
});
