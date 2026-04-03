import type { AuditReport } from '../auditors/types.js';

export function renderJSON(report: AuditReport): string {
  return JSON.stringify(
    {
      tool: 'ascdoc',
      version: '1.0.0',
      app: {
        name: report.appName,
        bundleId: report.bundleId,
        version: report.version,
        platform: report.platform,
      },
      date: report.date,
      score: report.score,
      grade: report.grade,
      gradeLabel: report.gradeLabel,
      summary: report.summary,
      findings: report.findings,
      results: report.results.map((r) => ({
        module: r.module,
        label: r.label,
        findingCount: r.findings.length,
        duration: r.duration,
        findings: r.findings.map((f) => ({
          id: f.id,
          severity: f.severity,
          title: f.title,
          message: f.message,
          locale: f.locale || null,
          remedy: f.remedy || null,
        })),
      })),
    },
    null,
    2,
  );
}
