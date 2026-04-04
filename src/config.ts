import fs from 'node:fs';
import path from 'node:path';

export interface ASCConfig {
  keyId: string;
  issuerId: string;
  keyPath: string;
  privateKey?: string;
  appId?: string;
  minScore: number;
  skip: string[];
  only: string[];
  format: 'terminal' | 'markdown' | 'json' | 'html' | 'github';
  output?: string;
  ci: boolean;
  demo: boolean;
  strict: boolean;
  compare?: string;
}

const CONFIG_FILE_NAMES = ['.ascdocrc.json', '.ascdocrc', 'ascdoc.config.json'];

function findConfigFile(cwd: string): string | null {
  for (const name of CONFIG_FILE_NAMES) {
    const filePath = path.join(cwd, name);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  return null;
}

function loadConfigFile(filePath: string): Partial<ASCConfig> {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}

function loadEnvConfig(): Partial<ASCConfig> {
  const config: Partial<ASCConfig> = {};

  if (process.env.ASC_KEY_ID) config.keyId = process.env.ASC_KEY_ID;
  if (process.env.ASC_ISSUER_ID) config.issuerId = process.env.ASC_ISSUER_ID;
  if (process.env.ASC_KEY_PATH) config.keyPath = process.env.ASC_KEY_PATH;
  if (process.env.ASC_PRIVATE_KEY) config.privateKey = process.env.ASC_PRIVATE_KEY;
  if (process.env.ASC_APP_ID) config.appId = process.env.ASC_APP_ID;
  if (process.env.ASC_MIN_SCORE) config.minScore = parseInt(process.env.ASC_MIN_SCORE, 10);

  return config;
}

export function resolveConfig(cliOptions: Partial<ASCConfig>): ASCConfig {
  const defaults: ASCConfig = {
    keyId: '',
    issuerId: '',
    keyPath: '',
    appId: undefined,
    minScore: 0,
    skip: [],
    only: [],
    format: 'terminal',
    output: undefined,
    ci: false,
    demo: false,
    strict: false,
    compare: undefined,
  };

  // Layer 1: Config file
  const configFilePath = findConfigFile(process.cwd());
  const fileConfig = configFilePath ? loadConfigFile(configFilePath) : {};

  // Layer 2: Environment variables
  const envConfig = loadEnvConfig();

  // Layer 3: CLI options (highest priority)
  const merged: ASCConfig = {
    ...defaults,
    ...fileConfig,
    ...envConfig,
    ...stripUndefined(cliOptions),
  };

  return merged;
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const result: Partial<T> = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      result[key] = obj[key];
    }
  }
  return result;
}

export function validateConfig(config: ASCConfig): string[] {
  if (config.demo) return [];

  const errors: string[] = [];

  if (!config.keyId) {
    errors.push('Missing --key-id (or ASC_KEY_ID env variable)');
  }
  if (!config.issuerId) {
    errors.push('Missing --issuer-id (or ASC_ISSUER_ID env variable)');
  }
  
  if (!config.privateKey && !config.keyPath) {
    errors.push('Missing --key (or ASC_PRIVATE_KEY_PATH / ASC_PRIVATE_KEY env variable)');
  } else if (config.keyPath && !config.privateKey && !fs.existsSync(config.keyPath)) {
    errors.push(`Key file not found: ${config.keyPath}`);
  }

  return errors;
}
