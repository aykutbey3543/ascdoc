import type { AuditReport } from '../auditors/types.js';

export function renderGitHub(report: AuditReport): string {
  const lines: string[] = [];

  for (const finding of report.findings) {
    let annotationType = 'notice';
    if (finding.severity === 'critical' || finding.severity === 'high') {
      annotationType = 'error';
    } else if (finding.severity === 'warning') {
      annotationType = 'warning';
    }

    const title = `[${finding.id}] ${finding.title.replace(/`/g, '')}`;
    let message = finding.message;
    if (finding.locale) {
      message = `(${finding.locale}) ${message}`;
    }
    if (finding.remedy) {
      message += ` -> Remedy: ${finding.remedy}`;
    }

    const escapeData = (s: string) => 
      s.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');

    lines.push(`::${annotationType} title=${escapeData(title)}::${escapeData(message)}`);
  }

  lines.push(
    `::notice title=ASC Doctor Summary::Score: ${report.score}/100. Critical: ${report.summary.critical}, High: ${report.summary.high}, Warning: ${report.summary.warning}, Info: ${report.summary.info}`
  );

  return lines.join('\n');
}
