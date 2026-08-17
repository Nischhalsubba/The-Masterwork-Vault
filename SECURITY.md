# Security Policy

## Supported version

Security fixes are applied to the current `main` branch and the production release built from it.

## Reporting a vulnerability

Do not open a public issue for suspected vulnerabilities, exposed credentials, or privacy-sensitive findings.

Use GitHub's private vulnerability reporting feature when available. If private reporting is unavailable, contact the repository owner privately through the contact information on the GitHub profile.

Do not include real credentials, personal data, or destructive proof-of-concept material in reports.

## Repository security baseline

Maintained releases are expected to pass:

- dependency auditing with no known vulnerabilities accepted by the release gate;
- CodeQL analysis for supported source languages;
- recipe, knowledge, domain-math, production-build, and browser quality checks;
- least-privilege GitHub Actions permissions;
- pinned third-party GitHub Actions revisions;
- pinned runtime and direct dependency versions;
- secret-free source control and environment-specific credentials stored outside the repository.

A passing automated scan reduces known risk but cannot prove that software is risk-free. New findings are treated as defects and remediated through the normal branch, pull-request, validation, and controlled-release process.
