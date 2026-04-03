import type { AppData } from '../api/types.js';
import type { AuditResult, Finding } from './types.js';

const GENERIC_WORDS = [
  'best', 'great', 'amazing', 'awesome', 'top', 'number one', '#1',
  'the best', 'most popular', 'world\'s', 'leading', 'ultimate',
  'premium', 'pro', 'simple', 'easy',
];

export function auditSubtitle(data: AppData): AuditResult {
  const start = Date.now();
  const findings: Finding[] = [];

  for (const loc of data.appInfoLocalizations) {
    const locale = loc.attributes.locale;
    const subtitle = loc.attributes.subtitle;
    const appName = loc.attributes.name;

    // SUB-001: Missing subtitle
    if (!subtitle || subtitle.trim().length === 0) {
      findings.push({
        id: 'SUB-001',
        module: 'subtitle',
        severity: 'warning',
        title: `Missing subtitle for locale \`${locale}\``,
        message: `No subtitle is set for ${locale}. Subtitles appear below the app name in search results and improve discoverability.`,
        locale,
        remedy: `Add a compelling subtitle (max 30 chars) for ${locale} that highlights your app's key value proposition.`,
      });
      continue;
    }

    // SUB-002: Subtitle too short
    if (subtitle.trim().length < 10) {
      findings.push({
        id: 'SUB-002',
        module: 'subtitle',
        severity: 'info',
        title: `Subtitle too short for locale \`${locale}\``,
        message: `The subtitle for ${locale} is only ${subtitle.trim().length} characters ("${subtitle.trim()}"). Consider using more of the 30-character limit.`,
        locale,
        remedy: `Expand the subtitle for ${locale} to better utilize the 30-character limit.`,
      });
    }

    // SUB-003: Subtitle repeats app name
    if (appName && subtitle.toLowerCase().includes(appName.toLowerCase())) {
      findings.push({
        id: 'SUB-003',
        module: 'subtitle',
        severity: 'warning',
        title: `Subtitle repeats app name for locale \`${locale}\``,
        message: `The subtitle for ${locale} ("${subtitle}") contains the app name ("${appName}"). This wastes valuable subtitle space and may trigger review flags.`,
        locale,
        remedy: `Use the subtitle to add new information, not repeat the app name. Focus on features or benefits.`,
      });
    }

    // SUB-004: Generic/vague subtitle
    const lowerSubtitle = subtitle.toLowerCase();
    const matchedGeneric = GENERIC_WORDS.find((word) => lowerSubtitle.includes(word));
    if (matchedGeneric) {
      findings.push({
        id: 'SUB-004',
        module: 'subtitle',
        severity: 'warning',
        title: `Generic subtitle for locale \`${locale}\``,
        message: `The subtitle for ${locale} ("${subtitle}") contains the generic term "${matchedGeneric}". Apple may flag superlative or subjective claims.`,
        locale,
        remedy: `Replace generic terms with specific, factual descriptions of what your app does. Example: Use "Track daily expenses" instead of "Best finance app".`,
      });
    }

    // SUB-005: Subtitle exceeds 30 characters
    if (subtitle.length > 30) {
      findings.push({
        id: 'SUB-005',
        module: 'subtitle',
        severity: 'high',
        title: `Subtitle too long for locale \`${locale}\``,
        message: `The subtitle for ${locale} is ${subtitle.length} characters, exceeding the 30-character limit. It will be truncated.`,
        locale,
        remedy: `Shorten the subtitle for ${locale} to 30 characters or fewer.`,
      });
    }
  }

  return {
    module: 'subtitle',
    label: 'Subtitle',
    icon: '💬',
    findings,
    duration: Date.now() - start,
  };
}
