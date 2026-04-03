<div align="center">

<img src="assets/social-preview.png" alt="ASC Doctor" width="640">

# 🩺 ASC Doctor

**Release readiness auditor for App Store Connect**

One command. Full diagnosis. Ship with confidence.

[![npm version](https://img.shields.io/npm/v/ascdoc?style=flat-square&color=CB3837)](https://www.npmjs.com/package/ascdoc)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square)](https://www.typescriptlang.org/)

</div>

---

> **Stop wondering "what did I forget?" before every App Store submission.**
>
> ASC Doctor connects to the App Store Connect API and audits your app's metadata across 8 modules — localization, screenshots, age rating, subtitles, privacy, subscriptions, storefront coverage, and review info. Get an instant risk score, actionable findings, and a beautiful report.

## ⚡ Quick Start

```bash
# Try it instantly with demo data (no API key needed!)
npx @spectrex/ascdoc --demo

# Run against your real app
npx @spectrex/ascdoc --key-id YOUR_KEY_ID --issuer-id YOUR_ISSUER_ID --key ./AuthKey.p8
```

## 🎯 What It Catches

| Module | What It Checks |
|--------|---------------|
| 🌍 **Localization** | Missing descriptions, empty keywords, placeholder text ("Lorem ipsum", "TODO"), short descriptions |
| 📱 **Screenshots** | Empty screenshot slots, missing required device types (6.9" iPhone, 13" iPad), locale coverage gaps |
| 🔞 **Age Rating** | Unset declarations, gambling inconsistencies, kids-band + mature content conflicts |
| 💬 **Subtitle** | Missing subtitles, generic text ("Best App Ever"), name repetition, exceeding 30-char limit |
| 🔒 **Privacy** | Missing privacy policy URL, invalid/unreachable URLs, non-HTTPS links |
| 💳 **Subscriptions & IAP** | Missing display names, empty descriptions, subscription group localization gaps |
| 🌐 **Storefront Coverage** | Limited territories, missing major markets (US, JP, DE...), wasted localizations |
| 📋 **Review Info** | Missing contact info, demo account gaps, empty review notes |

## 📊 Risk Scoring

Every finding is weighted by severity and contributes to a **0-100 risk score**:

| Grade | Score | Meaning |
|-------|-------|---------|
| 🟢 **A** | 90-100 | Ship it! |
| 🟡 **B** | 75-89 | Almost ready |
| 🟠 **C** | 50-74 | Needs attention |
| 🔴 **D** | 25-49 | High risk |
| ⛔ **F** | 0-24 | Do not submit |

Severities: 🔴 Critical (−15pts) · 🟠 High (−8pts) · 🟡 Warning (−3pts) · ℹ️ Info (−1pt)

## 🔧 Installation

```bash
# Use directly with npx (recommended)
npx @spectrex/ascdoc --demo

# Or install globally
npm install -g @spectrex/ascdoc

# Or install locally
npm install --save-dev @spectrex/ascdoc
```

## 🔑 Setup

ASC Doctor uses the **App Store Connect API** (read-only). You need an API key:

1. Go to [App Store Connect](https://appstoreconnect.apple.com) → **Users and Access** → **Integrations** → **App Store Connect API**
2. Click **Generate API Key** with at least **App Manager** role
3. Download the `.p8` private key file (⚠️ you can only download this once!)
4. Note your **Key ID** and **Issuer ID**

See the [full setup guide](docs/setup-guide.md) for detailed instructions.

## 📖 Usage

### Basic

```bash
ascdoc --key-id ABC123 --issuer-id DEF456 --key ./AuthKey.p8
```

### Specify an App

```bash
# Auto-detects if you have only one app
# Otherwise, specify the app ID:
ascdoc --app-id 1234567890 --key-id ABC123 --issuer-id DEF456 --key ./AuthKey.p8
```

### Output Formats

```bash
# Beautiful terminal output (default)
ascdoc --format terminal

# Markdown report (great for PRs and docs)
ascdoc --format markdown --output report.md

# JSON (for CI/CD pipelines)
ascdoc --format json
```

### Filter Modules

```bash
# Only run specific audits
ascdoc --only localization,screenshots

# Skip specific audits
ascdoc --skip storefront,review-info
```

### CI/CD Integration

```bash
# Exit with code 1 if score is below threshold
ascdoc --ci --min-score 75 --format json

# In your GitHub Actions workflow:
# - name: Audit App Store readiness
#   run: npx @spectrex/ascdoc --ci --min-score 75 --format json
```

### Environment Variables

```bash
export ASC_KEY_ID=ABC123
export ASC_ISSUER_ID=DEF456
export ASC_KEY_PATH=./AuthKey.p8
export ASC_APP_ID=1234567890  # optional

ascdoc  # Uses env variables automatically
```

### Config File

Create `.ascdocrc.json` in your project root:

```json
{
  "keyId": "ABC123",
  "issuerId": "DEF456",
  "keyPath": "./AuthKey.p8",
  "appId": "1234567890",
  "minScore": 75,
  "skip": ["storefront"],
  "format": "terminal"
}
```

Then just run:

```bash
ascdoc
```

## 🔒 Security

- ASC Doctor is **read-only** — it never modifies your App Store Connect data
- API keys are never stored, logged, or transmitted anywhere except to Apple's API
- Add `.p8` files to your `.gitignore` — never commit private keys

## 📋 All Options

```
Usage: ascdoc [options]

Options:
  --key-id <id>        App Store Connect API Key ID
  --issuer-id <id>     App Store Connect API Issuer ID
  --key <path>         Path to .p8 private key file
  --app-id <id>        App ID (auto-detected if only one app)
  --format <type>      Output format: terminal, markdown, json (default: terminal)
  --output <path>      Save report to file
  --only <modules>     Run only these audit modules (comma-separated)
  --skip <modules>     Skip these audit modules (comma-separated)
  --ci                 CI mode: exit with non-zero if score below --min-score
  --min-score <score>  Minimum score for CI mode (default: 75)
  --demo               Run with demo data (no API key required)
  --list-modules       List available audit modules
  -V, --version        Output the version number
  -h, --help           Display help
```

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

```bash
# Clone the repo
git clone https://github.com/aykutbey3543/ascdoc.git
cd ascdoc

# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Try with demo data
node dist/index.js --demo
```

### Adding a New Audit Rule

1. Add your check to the appropriate auditor in `src/auditors/`
2. Use the existing `Finding` interface with a unique ID (e.g., `LOC-009`)
3. Include a `remedy` field with an actionable fix suggestion
4. Add a test in `tests/auditors/`

## 📄 License

MIT © [Spectrex](https://github.com/aykutbey3543)

---

<div align="center">

**If ASC Doctor saved you from a rejection, consider giving it a ⭐**

[Report Bug](https://github.com/aykutbey3543/ascdoc/issues) · [Request Feature](https://github.com/aykutbey3543/ascdoc/issues) · [Discussions](https://github.com/aykutbey3543/ascdoc/discussions)

</div>
