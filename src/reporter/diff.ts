import chalk from 'chalk';
import type { AuditReport, Finding } from '../auditors/types.js';

function getFindingKey(finding: Finding): string {
  return `${finding.id}::${finding.title}`;
}

export function renderDiff(current: AuditReport, previous: AuditReport): string {
  const currentKeys = new Map<string, Finding>();
  for (const f of current.findings) {
    currentKeys.set(getFindingKey(f), f);
  }

  const previousKeys = new Map<string, Finding>();
  for (const f of previous.findings) {
    previousKeys.set(getFindingKey(f), f);
  }

  const newFindings: Finding[] = [];
  const resolvedFindings: Finding[] = [];
  const existingFindings: Finding[] = [];

  for (const [key, finding] of currentKeys) {
    if (!previousKeys.has(key)) {
      newFindings.push(finding);
    } else {
      existingFindings.push(finding);
    }
  }

  for (const [key, finding] of previousKeys) {
    if (!currentKeys.has(key)) {
      resolvedFindings.push(finding);
    }
  }

  const lines: string[] = [];

  lines.push('');
  lines.push(chalk.bold('  🩺 ASC Doctor Diff Report'));
  lines.push(chalk.dim(`  Comparing current audit with previous report`));
  lines.push('');

  const scoreDiff = current.score - previous.score;
  const scoreDiffStr = scoreDiff > 0 ? chalk.green(`+${scoreDiff}`) : scoreDiff < 0 ? chalk.red(`${scoreDiff}`) : chalk.dim('0');

  lines.push(`  Score:    ${current.score}/100 (${scoreDiffStr})`);
  lines.push('');
  
  lines.push(`  ${chalk.green('✔')} Resolved: ${resolvedFindings.length}`);
  lines.push(`  ${chalk.red('✖')} New:      ${newFindings.length}`);
  lines.push(`  ${chalk.dim('▪')} Existing: ${existingFindings.length}`);
  lines.push('');

  if (resolvedFindings.length > 0) {
    lines.push(chalk.green.bold('  🎉 Resolved Findings'));
    lines.push(chalk.dim('  ─────────────────────────────────────────'));
    for (const f of resolvedFindings) {
      lines.push(chalk.green(`  + [${f.id}] ${f.title}`));
    }
    lines.push('');
  }

  if (newFindings.length > 0) {
    lines.push(chalk.red.bold('  🚨 New Findings'));
    lines.push(chalk.dim('  ─────────────────────────────────────────'));
    for (const f of newFindings) {
      lines.push(chalk.red(`  - [${f.id}] ${f.title}`));
      lines.push(chalk.dim(`    ${f.message}`));
      lines.push('');
    }
  }

  if (newFindings.length === 0 && resolvedFindings.length === 0) {
    lines.push(chalk.dim('  No changes detected in findings.'));
    lines.push('');
  }

  return lines.join('\n');
}
