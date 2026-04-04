<div align="center">

<img src="assets/social-preview.png" alt="ASC Doctor" width="640">

# 🩺 ASC Doctor

**Catch App Store rejection risks before you submit.**

ASC Doctor is a read-only release auditor for App Store Connect. It analyzes your metadata, screenshots, URLs, and localizations against App Store guidelines and instantly gives you a risk score and an actionable HTML report.

[![npm version](https://img.shields.io/npm/v/@spectrex/ascdoc?style=flat-square&color=CB3837)](https://www.npmjs.com/package/@spectrex/ascdoc)
[![npm downloads](https://img.shields.io/npm/dm/@spectrex/ascdoc?style=flat-square&color=333333)](https://www.npmjs.com/package/@spectrex/ascdoc)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Build Status](https://img.shields.io/github/actions/workflow/status/spectreet/ascdoc/test.yml?branch=main&style=flat-square)](https://github.com/spectreet/ascdoc/actions)

</div>

---

### Features at a glance:
- **🔍 Read-only**: We only read your data using the official ASC API—we never modify it.
- **🤖 CI-ready**: Native GitHub Actions annotations and non-zero exit codes for pipeline failures.
- **🌐 URL Reachability**: Real-world testing of privacy, support, and marketing URLs (detects broken or non-HTTPS links).
- **✨ Beautiful Reports**: Interactive HTML reports, Markdown for PR comments, and JSON for automation.
- **🔄 Compare Mode**: Audit only the *changes* since your last live version to spot regression risks.

## ⚡ Quick Start

Experience it instantly via our demo data (no API key required):

```bash
npx @spectrex/ascdoc --demo --format html --output report.html
# Then open report.html in your browser!
```

> **Curious what a report looks like?** 
> 🔴 [Sample "Bad" Report](docs/samples/sample-bad.html) (Failing)
> 🟢 [Sample "Good" Report](docs/samples/sample-good.html) (Passing)
> 📄 [Sample JSON Data](docs/samples/sample-report.json) (For CI integrators)

## 🎯 What It Catches

| Module | What It Checks |
|--------|---------------|
| 🌍 **Localization** | Placeholder text ("TODO"), name repetition, missing descriptions, broken URLs |
| 📱 **Screenshots** | Missing required device types (6.9", 13" iPad), checksum duplicates across locales |
| 🔞 **Age Rating** | Unset declarations, gambling inconsistencies, Kids-category conflicts |
| 💬 **Subtitle/ASO** | Generic text ("Best App Ever"), name repetition, exceeding 30-char limits |
| 🔒 **Privacy** | Missing policy URLs, non-HTTPS links, unreachable privacy endpoints |
| 💳 **Subscriptions** | Missing display names, trial messaging without billing terms, localization gaps |
| 🌐 **Storefronts** | Limited territories, missing major markets, wasted localization effort |
| 📋 **Review Info** | Missing contact info, missing demo account credentials, empty review notes |

## ⚖️ Audit vs. Manage (The "Why")

ASC Doctor **does not replace** tools like `fastlane` or `asc`. 

*   **Fastlane/ASC** is for *writing* and *executing* changes. 
*   **ASC Doctor** is for *verifying* your readiness before the App Store Review team does.

We catch the human errors those tools don't: unreachable URLs, "Lorem ipsum" hidden in deep localizations, or missing billing terminology in your subscription descriptions.

### What it does NOT do:
*   Modify any data on App Store Connect.
*   Upload binaries or screenshots.
*   Automate the submisson process itself.

## 📊 Risk Scoring

Every finding is weighted by severity and contributes to a **0-100 risk score**:

| Grade | Meaning | Score Range |
|-------|---------|-------------|
| 🟢 **A** | Ship it! | 90-100 |
| 🟡 **B** | Almost ready | 75-89 |
| 🟠 **C** | Needs attention | 50-74 |
| 🔴 **D** | High risk | 25-49 |
| ⛔ **F** | Do not submit | 0-24 |

Severities: 🔴 Critical (−15pts) · 🟠 High (−8pts) · 🟡 Warning (−3pts) · ℹ️ Info (−1pt)

## 🔑 Setup

ASC Doctor uses the **App Store Connect API**.

1. Go to **Users and Access** → **Integrations** → **App Store Connect API**
2. Generate an API Key with **App Manager** role.
3. Download the `.p8` key and note your **Key ID** and **Issuer ID**.

## 🚀 CI/CD Integration

### Exit Codes
*   `0`: Audit completed successfully (all findings within score threshold).
*   `1`: Tool error or audit failed (`--min-score` or `--strict` threshold not met).

### GitHub Actions
To get native annotations on your commits, use `--format github`:

```yaml
- name: Audit App Store readiness
  run: npx @spectrex/ascdoc --format github --min-score 80
  env:
    ASC_KEY_ID: ${{ secrets.ASC_KEY_ID }}
    ASC_ISSUER_ID: ${{ secrets.ASC_ISSUER_ID }}
    ASC_KEY: ${{ secrets.ASC_KEY_P8_CONTENT }}
```

## 🔧 Advanced Usage

```bash
# Export HTML for PR artifacts
ascdoc --format html --output report.html

# Only run specific modules
ascdoc --only screenshots,localization

# Audit only changes vs. live version
ascdoc --compare
```

## 📄 License

MIT © [spectreet](https://github.com/spectreet)

---

<div align="center">

**If ASC Doctor saved you from a rejection, consider giving it a ⭐**

[Report Bug](https://github.com/spectreet/ascdoc/issues) · [Discussions](https://github.com/spectreet/ascdoc/discussions)

</div>
