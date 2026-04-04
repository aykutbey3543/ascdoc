# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.2] - 2026-04-03

### Added
- **GitHub Actions Reporter**: Added `--format github` to generate native CI annotations.
- **Deep Subscription Audit**: New checks for trial messaging and mandatory billing terms.
- **Reachability Validation**: Enhanced URL checking with multiple status code fallback logic.
- **Unit Testing Suite**: Added comprehensive tests for HTML reports and URL reachability.
- **Dynamic Versioning**: CLI and reports now sync perfectly with `package.json`.

### Fixed
- Fixed broken binary path in `package.json` for npm global installs.
- Improved remedy suggestions for localization and subtitle modules.
- Fixed version drift across CLI help and reports.

### Changed
- **Branding**: Rebranded to `@spectreet/ascdoc`.
- **Documentation**: Complete README overhaul with Quick Start, CI/CD snippets, and samples.

## [1.0.0] - 2026-04-03

### Added
- Initial release of ASC Doctor.
- Support for Localization, Screenshots, Age Rating, and App Metadata audits.
- Scoring system and Grade evaluation.
- HTML, Markdown, JSON, and Terminal reporters.
