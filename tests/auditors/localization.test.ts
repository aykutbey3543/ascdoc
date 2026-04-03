import { describe, it, expect, vi } from 'vitest';
import { auditLocalization } from '../../src/auditors/localization.js';
import { generateDemoData } from '../../src/demo/data.js';
import type { AppData } from '../../src/api/types.js';

vi.mock('../../src/utils/url.js', () => ({
  checkUrlReachability: async () => ({ reachable: true }),
}));

describe('Localization Auditor', () => {
  it('detects missing description', async () => {
    const data = generateDemoData();
    const result = await auditLocalization(data);

    const finding = result.findings.find((f) => f.id === 'LOC-001');
    expect(finding).toBeDefined();
    expect(finding?.locale).toBe('de-DE');
    expect(finding?.severity).toBe('critical');
  });

  it('detects placeholder text', async () => {
    const data = generateDemoData();
    const result = await auditLocalization(data);

    const finding = result.findings.find((f) => f.id === 'LOC-004');
    expect(finding).toBeDefined();
    expect(finding?.locale).toBe('ja');
    expect(finding?.severity).toBe('critical');
  });

  it('detects missing keywords', async () => {
    const data = generateDemoData();
    const result = await auditLocalization(data);

    const finding = result.findings.find((f) => f.id === 'LOC-002');
    expect(finding).toBeDefined();
    expect(finding?.locale).toBe('de-DE');
  });

  it('detects short descriptions', async () => {
    const data = generateDemoData();
    const result = await auditLocalization(data);

    const shortFindings = result.findings.filter((f) => f.id === 'LOC-005');
    expect(shortFindings.length).toBeGreaterThan(0);
  });

  it('returns module metadata', async () => {
    const data = generateDemoData();
    const result = await auditLocalization(data);

    expect(result.module).toBe('localization');
    expect(result.label).toBe('Localization');
    expect(result.icon).toBe('🌍');
    expect(result.duration).toBeGreaterThanOrEqual(0);
  });

  it('passes clean data', async () => {
    const cleanData: AppData = {
      ...generateDemoData(),
      versionLocalizations: [
        {
          type: 'appStoreVersionLocalizations',
          id: 'vloc-en',
          attributes: {
            locale: 'en-US',
            description: 'This is a real, proper description that is longer than 100 characters and describes the app features thoroughly and completely.',
            keywords: 'weather,forecast,rain',
            promotionalText: 'Now with real-time tracking!',
            whatsNew: 'Bug fixes.',
            marketingUrl: 'https://example.com',
            supportUrl: 'https://example.com/support',
          },
        },
      ],
      appInfoLocalizations: [
        {
          type: 'appInfoLocalizations',
          id: 'iloc-en',
          attributes: {
            locale: 'en-US',
            name: 'TestApp',
            subtitle: 'Great weather tool',
            privacyPolicyUrl: 'https://example.com/privacy',
            privacyChoicesUrl: null,
            privacyPolicyText: null,
          },
        },
      ],
    };

    const result = await auditLocalization(cleanData);
    const criticalOrHigh = result.findings.filter(
      (f) => f.severity === 'critical' || f.severity === 'high',
    );
    expect(criticalOrHigh.length).toBe(0);
  });
});
