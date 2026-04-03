import type { AuditReport } from '../auditors/types.js';
import { getGradeEmoji } from '../scoring/risk.js';

export function renderHTML(report: AuditReport): string {
  const css = `
    :root {
      --bg: #0f111a;
      --surface: #1e2136;
      --surface-hover: #2a2e47;
      --text: #e2e8f0;
      --text-muted: #94a3b8;
      --border: #334155;
      
      --critical: #ef4444;
      --high: #f97316;
      --warning: #eab308;
      --info: #3b82f6;
      --success: #22c55e;
    }

    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg);
      color: var(--text);
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .logo {
      font-size: 3rem;
      margin-bottom: 10px;
    }
    
    h1 {
      margin: 0;
      font-size: 2rem;
      font-weight: 700;
    }
    
    .subtitle {
      color: var(--text-muted);
      margin-top: 5px;
    }

    .score-card {
      background-color: var(--surface);
      border-radius: 12px;
      padding: 30px;
      text-align: center;
      margin-bottom: 40px;
      border: 1px solid var(--border);
      display: flex;
      justify-content: space-around;
      align-items: center;
    }

    .score-grade {
      font-size: 4rem;
      font-weight: 800;
      line-height: 1;
    }

    .score-number {
      font-size: 1.5rem;
      color: var(--text-muted);
    }

    .app-meta {
      text-align: left;
    }

    .app-meta p {
      margin: 5px 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 40px;
      background: var(--surface);
      border-radius: 8px;
      overflow: hidden;
    }

    th, td {
      padding: 12px 16px;
      text-align: left;
      border-bottom: 1px solid var(--border);
    }
    
    th {
      background: var(--surface-hover);
      color: var(--text-muted);
      font-weight: 600;
      text-transform: uppercase;
      font-size: 0.85rem;
      letter-spacing: 0.05em;
    }

    tr:last-child td { border-bottom: none; }

    .tag {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
      min-width: 32px;
    }
    
    .tag.critical { background: rgba(239, 68, 68, 0.2); color: var(--critical); }
    .tag.high { background: rgba(249, 115, 22, 0.2); color: var(--high); }
    .tag.warning { background: rgba(234, 179, 8, 0.2); color: var(--warning); }
    .tag.info { background: rgba(59, 130, 246, 0.2); color: var(--info); }
    .tag.zero { color: var(--text-muted); }

    .findings-section { margin-bottom: 40px; }
    
    .finding-card {
      background: var(--surface);
      border-left: 4px solid var(--border);
      border-radius: 0 8px 8px 0;
      padding: 20px;
      margin-bottom: 16px;
    }

    .finding-card.critical { border-left-color: var(--critical); }
    .finding-card.high { border-left-color: var(--high); }
    .finding-card.warning { border-left-color: var(--warning); }
    .finding-card.info { border-left-color: var(--info); }

    .finding-header {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
    }

    .finding-id {
      background: var(--surface-hover);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 0.85rem;
      margin-right: 12px;
      color: var(--text-muted);
    }

    .finding-title {
      font-weight: 600;
      font-size: 1.1rem;
      margin: 0;
    }

    .finding-message { margin: 0 0 12px 0; color: #cbd5e1; }
    
    .finding-remedy {
      background: rgba(34, 197, 94, 0.1);
      padding: 12px;
      border-radius: 6px;
      border: 1px solid rgba(34, 197, 94, 0.2);
    }

    .finding-remedy strong {
      color: var(--success);
    }

    .passed-checks {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .passed-chip {
      background: var(--surface);
      border: 1px solid var(--border);
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    footer {
      text-align: center;
      padding-top: 40px;
      color: var(--text-muted);
      border-top: 1px solid var(--border);
      margin-top: 60px;
    }
    
    a { color: var(--info); text-decoration: none; }
    a:hover { text-decoration: underline; }
  `;

  // Grade color based on emoji/score
  let gradeColor = 'var(--text)';
  if (report.score >= 90) gradeColor = 'var(--success)';
  else if (report.score >= 75) gradeColor = 'var(--warning)';
  else if (report.score >= 50) gradeColor = 'var(--high)';
  else gradeColor = 'var(--critical)';

  let html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ASC Doctor Report - ${report.appName}</title>
  <style>${css}</style>
</head>
<body>
  <div class="container">
    <header>
      <div class="logo">🩺</div>
      <h1>ASC Doctor Report</h1>
      <div class="subtitle">Release readiness audit</div>
    </header>

    <div class="score-card">
      <div class="app-meta">
        <h2>${report.appName}</h2>
        <p><strong>Bundle ID:</strong> <code>${report.bundleId}</code></p>
        <p><strong>Version:</strong> ${report.version} (${report.platform})</p>
        <p><strong>Date:</strong> ${report.date}</p>
      </div>
      <div style="text-align: center;">
        <div class="score-grade" style="color: ${gradeColor}">
          ${getGradeEmoji(report.score)} ${report.grade}
        </div>
        <div class="score-number">${report.score} / 100</div>
        <div style="margin-top: 8px; font-weight: 600; color: ${gradeColor}">${report.gradeLabel}</div>
      </div>
    </div>

    <h2>Audit Summary</h2>
    <table>
      <thead>
        <tr>
          <th>Module</th>
          <th style="text-align: center;">Critical</th>
          <th style="text-align: center;">High</th>
          <th style="text-align: center;">Warning</th>
          <th style="text-align: center;">Info</th>
        </tr>
      </thead>
      <tbody>`;

  for (const result of report.results) {
    const c = result.findings.filter((f) => f.severity === 'critical').length;
    const h = result.findings.filter((f) => f.severity === 'high').length;
    const w = result.findings.filter((f) => f.severity === 'warning').length;
    const i = result.findings.filter((f) => f.severity === 'info').length;

    const cTag = `<span class="tag ${c ? 'critical' : 'zero'}">${c || '-'}</span>`;
    const hTag = `<span class="tag ${h ? 'high' : 'zero'}">${h || '-'}</span>`;
    const wTag = `<span class="tag ${w ? 'warning' : 'zero'}">${w || '-'}</span>`;
    const iTag = `<span class="tag ${i ? 'info' : 'zero'}">${i || '-'}</span>`;

    const status = c + h + w === 0 ? ' &nbsp;✅' : '';

    html += `
        <tr>
          <td><strong>${result.icon} ${result.label}</strong>${status}</td>
          <td style="text-align: center;">${cTag}</td>
          <td style="text-align: center;">${hTag}</td>
          <td style="text-align: center;">${wTag}</td>
          <td style="text-align: center;">${iTag}</td>
        </tr>`;
  }

  html += `
      </tbody>
    </table>`;

  const severityOrder = ['critical', 'high', 'warning', 'info'] as const;
  const severityTitles = {
    critical: '🔴 Critical Findings',
    high: '🟠 High Findings',
    warning: '🟡 Warnings',
    info: 'ℹ️ Informational',
  };

  for (const severity of severityOrder) {
    const findings = report.findings.filter((f) => f.severity === severity);
    if (findings.length === 0) continue;

    html += `
    <div class="findings-section">
      <h2>${severityTitles[severity]}</h2>`;

    for (const finding of findings) {
      let title = finding.title.replace(/`([^`]+)`/g, '<code>$1</code>');
      let message = finding.message;

      html += `
      <div class="finding-card ${severity}">
        <div class="finding-header">
          <span class="finding-id">${finding.id}</span>
          <h3 class="finding-title">${title}</h3>
        </div>
        <p class="finding-message">${message}</p>`;

      if (finding.remedy) {
        html += `
        <div class="finding-remedy">
          <strong>Fix:</strong> ${finding.remedy}
        </div>`;
      }
      
      html += `
      </div>`;
    }
    
    html += `
    </div>`;
  }

  // Passed checks
  const passedModules = report.results.filter(
    (r) => r.findings.filter((f) => f.severity !== 'info').length === 0,
  );

  if (passedModules.length > 0) {
    html += `
    <h2>✅ Passed Checks</h2>
    <div class="passed-checks">`;
    for (const mod of passedModules) {
      html += `<div class="passed-chip">${mod.icon} ${mod.label}</div>`;
    }
    html += `
    </div>`;
  }

  html += `
    <footer>
      <p>Report generated by <a href="https://github.com/spectreet/ascdoc" target="_blank">ASC Doctor</a> - Release readiness auditor for App Store Connect</p>
    </footer>
  </div>
</body>
</html>`;

  return html;
}
