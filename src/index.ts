import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'node:fs';
import { resolveConfig, validateConfig, type ASCConfig } from './config.js';
import { APIClient } from './api/client.js';
import { fetchAppData } from './api/fetcher.js';
import { runAudit, getAuditorNames } from './auditors/index.js';
import { renderTerminal } from './reporter/terminal.js';
import { renderMarkdown } from './reporter/markdown.js';
import { renderJSON } from './reporter/json.js';
import { renderHTML } from './reporter/html.js';
import { renderGitHub } from './reporter/github.js';
import { renderDiff } from './reporter/diff.js';
import { generateDemoData } from './demo/data.js';

const VERSION = '1.0.0';

const program = new Command();

program
  .name('ascdoc')
  .description('🩺 Release readiness auditor for App Store Connect')
  .version(VERSION)
  .option('--key-id <id>', 'App Store Connect API Key ID')
  .option('--issuer-id <id>', 'App Store Connect API Issuer ID')
  .option('--key <path>', 'Path to .p8 private key file')
  .option('--app-id <id>', 'App ID (auto-detected if only one app)')
  .option(
    '-f, --format <format>',
    'Output format (terminal, markdown, json, html, github)',
    'terminal',
  ).option('--output <path>', 'Save report to file')
  .option('--only <modules>', 'Run only these audit modules (comma-separated)')
  .option('--skip <modules>', 'Skip these audit modules (comma-separated)')
  .option('--compare <path>', 'Path to a previous JSON report to compare against')
  .option('--ci', 'CI mode: exit with non-zero if score below --min-score', false)
  .option('--min-score <score>', 'Minimum score for CI mode (default: 75)', '75')
  .option('--strict', 'Strict mode: only report critical and high findings', false)
  .option('--demo', 'Run with demo data (no API key required)', false)
  .option('--list-modules', 'List available audit modules')
  .action(async (options) => {
    // Handle --list-modules
    if (options.listModules) {
      console.log('\n  Available audit modules:\n');
      for (const name of getAuditorNames()) {
        console.log(`    • ${name}`);
      }
      console.log('');
      process.exit(0);
    }

    // Resolve config from file + env + CLI
    const config = resolveConfig({
      keyId: options.keyId,
      issuerId: options.issuerId,
      keyPath: options.key,
      appId: options.appId,
      format: options.format as ASCConfig['format'],
      output: options.output,
      skip: options.skip ? options.skip.split(',').map((s: string) => s.trim()) : [],
      only: options.only ? options.only.split(',').map((s: string) => s.trim()) : [],
      compare: options.compare,
      ci: options.ci,
      minScore: parseInt(options.minScore, 10),
      strict: options.strict,
      demo: options.demo,
    });

    // Show banner
    if (config.format === 'terminal') {
      console.log('');
      console.log(chalk.bold('  🩺 ASC Doctor') + chalk.dim(` v${VERSION}`));
      console.log(chalk.dim('  Release readiness auditor for App Store Connect'));
      console.log('');
    }

    // Validate config
    const errors = validateConfig(config);
    if (errors.length > 0) {
      console.error(chalk.red('\n  ✖ Configuration errors:\n'));
      for (const error of errors) {
        console.error(chalk.red(`    • ${error}`));
      }
      console.error('');
      console.error(chalk.dim('  Use --demo to try with sample data, or see --help for options.'));
      console.error('');
      process.exit(1);
    }

    let appData;

    if (config.demo) {
      // Demo mode
      if (config.format === 'terminal') {
        console.log(chalk.yellow('  ⚠ Running in demo mode with sample data'));
        console.log('');
      }
      appData = generateDemoData();
    } else {
      // Real API mode
      const spinner = config.format === 'terminal'
        ? ora({ text: 'Connecting to App Store Connect...', indent: 2 }).start()
        : null;

      try {
        const client = new APIClient({
          keyId: config.keyId,
          issuerId: config.issuerId,
          keyPath: config.keyPath,
        });

        if (spinner) spinner.text = 'Fetching app data...';
        appData = await fetchAppData(client, config.appId);
        spinner?.succeed(`Fetched data for ${appData.app.attributes.name}`);
      } catch (error) {
        spinner?.fail('Failed to fetch data from App Store Connect');
        console.error('');
        console.error(chalk.red(`  ${error instanceof Error ? error.message : String(error)}`));
        console.error('');
        process.exit(1);
      }
    }

    // Run audit
    const spinnerAudit = config.format === 'terminal'
      ? ora({ text: 'Running audits...', indent: 2 }).start()
      : null;

    const report = await runAudit(appData, {
      skip: config.skip,
      only: config.only,
      strict: config.strict,
    });

    spinnerAudit?.succeed(`Audit complete — ${report.summary.total} findings`);

    if (config.format === 'terminal') {
      console.log('');
    }

    // Render output
    let output: string;
    if (config.compare && fs.existsSync(config.compare)) {
      try {
        const previous = JSON.parse(fs.readFileSync(config.compare, 'utf-8'));
        output = renderDiff(report, previous);
      } catch (e) {
        console.error(e);
        console.error(chalk.red(`  ✖ Failed to read or parse previous report at ${config.compare}`));
        process.exit(1);
      }
    } else {
      switch (config.format) {
        case 'markdown':
          output = renderMarkdown(report);
          break;
        case 'json':
          output = renderJSON(report);
          break;
        case 'html':
          output = renderHTML(report);
          break;
        case 'github':
          output = renderGitHub(report);
          break;
        default:
          output = renderTerminal(report);
      }
    }

    // Output
    if (config.output) {
      fs.writeFileSync(config.output, output, 'utf-8');
      if (config.format === 'terminal') {
        console.log(chalk.green(`  📄 Report saved to ${config.output}`));
        console.log('');
      }
    } else {
      console.log(output);
    }

    // CI mode exit code
    if (config.ci) {
      if (report.score < config.minScore) {
        process.exit(1);
      }
    }
  });

program.parse();
