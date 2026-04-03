import type { AppData } from '../api/types.js';
import type { AuditResult, AuditReport, Finding } from './types.js';
import { auditLocalization } from './localization.js';
import { auditScreenshots } from './screenshots.js';
import { auditAgeRating } from './age-rating.js';
import { auditSubtitle } from './subtitle.js';
import { auditPrivacy } from './privacy.js';
import { auditSubscriptions } from './subscription.js';
import { auditStorefront } from './storefront.js';
import { auditReviewInfo } from './review-info.js';
import { calculateRiskScore, getGrade, getGradeLabel } from '../scoring/risk.js';

interface AuditOptions {
  skip: string[];
  only: string[];
  strict?: boolean;
}

const ALL_AUDITORS = [
  { name: 'localization', fn: auditLocalization },
  { name: 'screenshots', fn: auditScreenshots },
  { name: 'age-rating', fn: auditAgeRating },
  { name: 'subtitle', fn: auditSubtitle },
  { name: 'privacy', fn: auditPrivacy },
  { name: 'subscription', fn: auditSubscriptions },
  { name: 'storefront', fn: auditStorefront },
  { name: 'review-info', fn: auditReviewInfo },
] as const;

export function getAuditorNames(): string[] {
  return ALL_AUDITORS.map((a) => a.name);
}

export async function runAudit(data: AppData, options: AuditOptions): Promise<AuditReport> {
  // Filter auditors based on skip/only options
  let auditors = [...ALL_AUDITORS];

  if (options.only.length > 0) {
    auditors = auditors.filter((a) => options.only.includes(a.name));
  }
  if (options.skip.length > 0) {
    auditors = auditors.filter((a) => !options.skip.includes(a.name));
  }

  // Run all auditors
  const results: AuditResult[] = await Promise.all(
    auditors.map(async (auditor) => await auditor.fn(data))
  );

  // Filter out warnings and infos if strict mode is enabled
  if (options.strict) {
    for (const r of results) {
      r.findings = r.findings.filter((f) => f.severity === 'critical' || f.severity === 'high');
    }
  }

  // Collect all findings
  const allFindings: Finding[] = results.flatMap((r) => r.findings);

  // Calculate score
  const score = calculateRiskScore(allFindings);
  const grade = getGrade(score);
  const gradeLabel = getGradeLabel(score);

  // Count by severity
  const critical = allFindings.filter((f) => f.severity === 'critical').length;
  const high = allFindings.filter((f) => f.severity === 'high').length;
  const warning = allFindings.filter((f) => f.severity === 'warning').length;
  const info = allFindings.filter((f) => f.severity === 'info').length;

  // Count passed modules (0 findings != info)
  const passed = results.filter(
    (r) => r.findings.filter((f) => f.severity !== 'info').length === 0,
  ).length;

  return {
    appName: data.app.attributes.name,
    bundleId: data.app.attributes.bundleId,
    version: data.version.attributes.versionString,
    platform: data.version.attributes.platform,
    date: new Date().toISOString().split('T')[0],
    score,
    grade,
    gradeLabel,
    results,
    findings: allFindings,
    summary: {
      critical,
      high,
      warning,
      info,
      total: allFindings.length,
      passed,
    },
  };
}
