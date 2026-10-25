# Security Policy

## Current security status

NEXO is under active development. The current frontend prototype stores application data, selected-user state, roles, and permission settings in browser storage such as `localStorage` and IndexedDB.

**This prototype is not a production security boundary.** Browser storage and client-side permission checks can be inspected or modified by the person using that browser. A visible permission restriction in the interface must not be treated as proof that an action is authorized.

Do not use the current prototype to store real credentials, secrets, highly sensitive personal information, or confidential production data.

## Security requirements before production

Before NEXO is used with real users or sensitive data, the production architecture must include, at minimum:

- Server-side authentication and authorization for every protected operation.
- Deny-by-default access decisions and least-privilege role assignments.
- Server-side validation of all untrusted input, including data received from clients.
- Stable user and resource IDs for ownership and access decisions; display names are not identities.
- Secure session and credential handling, with passwords never stored in browser storage.
- Protection against cross-site scripting, cross-site request forgery where applicable, injection, and insecure direct object references.
- Safe file-upload validation, access control, storage, and download handling.
- Security-focused automated tests for permissions, account status, ownership, and unauthorized access.
- Appropriate logging, monitoring, backup, recovery, dependency updates, and HTTPS deployment configuration.

These requirements are a planning baseline, not a claim that the prototype currently implements them.

## Reporting a vulnerability

Please do not publish exploitable vulnerability details in a public issue. If private vulnerability reporting is enabled for this repository, use GitHub's private reporting feature. Otherwise, contact the repository maintainer privately through an available GitHub contact method and include reproduction steps, affected files or routes, and the potential impact.

Please avoid including real user data, passwords, tokens, or other secrets in reports.

## Scope and responsible testing

Only test systems and data that you own or have explicit permission to assess. This policy does not grant permission to test third-party systems.
