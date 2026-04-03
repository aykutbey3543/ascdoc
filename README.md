<div align="center">

<img src="assets/social-preview.png" alt="ASC Doctor" width="640">

# 🩺 ASC Doctor

**Catch App Store rejection risks before you submit.**

ASC Doctor is a read-only release auditor for App Store Connect. It analyzes your metadata, screenshots, URLs, and localizations against App Store guidelines and instantly gives you a risk score and an actionable HTML report.

[![npm version](https://img.shields.io/npm/v/@spectrex/ascdoc?style=flat-square&color=CB3837)](https://www.npmjs.com/package/@spectrex/ascdoc)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square)](https://nodejs.org/)

</div>

---

### Features at a glance:
- **🔍 Read-only**: We only read your data using the official ASC API—we never modify it.
- **🤖 CI-ready**: Return non-zero exit codes to fail your GitHub Actions build on critical findings.
- **🌐 Real URL Reachability**: Actually tests your privacy, support, and marketing URLs to make sure they return `200 OK`.
- **✨ Beautiful Reports**: Export sharable HTML reports to attach to your release notes or PRs.

## ⚡ Quick Start

Experience it instantly via our demo data (no API key required):

```bash
npx @spectrex/ascdoc --demo --format html --output report.html
# Then open report.html in your browser!
```

> **Curious what a failing report looks like?** [View a sample HTML report](docs/samples/sample-bad.html)

### Run against your real App Store Connect account:
```bash
npx @spectrex/ascdoc --key-id YOUR_KEY_ID --issuer-id YOUR_ISSUER_ID --key ./AuthKey.p8
```

## ⚖️ Manage vs. Audit (Why not fastlane/asc?)

You might already use `fastlane` or `asc` CLI to upload metadata and manage screenshots. **ASC Doctor does not replace those tools.** 

**Fastlane/ASC** is for *managing* and *executing* changes. 
**ASC Doctor** is for *auditing* your readiness. 

It checks things those tools don't: Are your URLs actually reaching a live server? Do you have "Lorem ipsum" hidden in a German localized string? Is your age rating conflicting with your app category? We find the human mistakes that automation pipelines blindly push.

## 🎯 What It Catches

| Module | What It Checks |
|--------|---------------|
| 🌍 **Localization** | Missing descriptions, placeholder text ("TODO"), short descriptions, live checking of marketing & support URLs |
| 📱 **Screenshots** | Empty slots, missing required device types (6.9" iPhone, 13" iPad), locale coverage gaps |
| 🔞 **Age Rating** | Unset declarations, gambling inconsistencies, kids-band + mature content conflicts |
| 💬 **Subtitle** | Missing subtitles, generic text ("Best App Ever"), name repetition, exceeding 30-char limit |
| 🔒 **Privacy** | Missing privacy policy URL, non-HTTPS links, unreachable privacy URLs |
| 💳 **Subscriptions** | Missing display names, empty descriptions, subscription group localization gaps |
| 🌐 **Storefronts** | Limited territories, missing major markets (US, JP, DE...), wasted localizations |
| 📋 **Review Info** | Missing contact info, missing demo account passwords, empty review notes |

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
```

## 🔑 Setup

ASC Doctor uses the **App Store Connect API**. You need an API key:

1. Go to [App Store Connect](https://appstoreconnect.apple.com) → **Users and Access** → **Integrations** → **App Store Connect API**
2. Click **Generate API Key** with at least **App Manager** role
3. Download the `.p8` private key file (⚠️ you can only download this once!)
4. Note your **Key ID** and **Issuer ID**

## 📖 Usage

### Output Formats

Generate beautiful terminal output, CI-friendly JSON, or shareable HTML reports.

```bash
# Terminal output (default)
ascdoc --format terminal

# Export an HTML Report
ascdoc --format html --output test-report.html

# Markdown report (great for PRs and docs)
ascdoc --format markdown --output report.md

# JSON (for parsing in CI/CD pipelines)
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

Use the `--ci` flag to block deployments if the score drops too low.

```bash
# Exit with code 1 if score is below 75
ascdoc --ci --min-score 75 --format json

# Example GitHub Actions snippet:
# - name: Audit App Store readiness
#   run: npx @spectrex/ascdoc --ci --min-score 75 --format html --output artifacts/report.html
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
  "format": "html",
  "output": "docs/asc-report.html"
}
```

Then just run:
```bash
ascdoc
```

## 🤝 Contributing

Contributions are welcome!

```bash
# Clone the repo
git clone https://github.com/spectreet/ascdoc.git
cd ascdoc
npm install
npm run build
node dist/index.js --demo
```

## 📄 License

MIT © [Spectrex](https://github.com/spectreet)

---

<div align="center">

**If ASC Doctor saved you from a rejection, consider giving it a ⭐**

[Report Bug](https://github.com/spectreet/ascdoc/issues) · [Requirements](https://github.com/spectreet/ascdoc/issues) · [Discussions](https://github.com/spectreet/ascdoc/discussions)

</div>
