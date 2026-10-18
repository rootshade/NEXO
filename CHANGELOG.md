# Changelog

All notable changes to NEXO will be documented in this file.

## [Unreleased]

### Added
- Floating notification center with task, letter, and message filters.
- Notification history with read and dismiss actions.
- Developer profile fields and NEXO repository information in Settings.
- Event broadcasts when messages and letters are created or settings are saved.

### Improved
- Removed the old top header bar while retaining the floating notification control.
- Persisted newly created messages before notifying the notification center.
- Kept developer profile details inside Settings instead of displaying them across the app.

### Notes
- Notifications and preferences currently rely on browser localStorage; they are not yet synchronized across users or devices.
- The Unreleased changes have not yet been validated with a clean production build.

## [0.1.0] - 2026-10-10

### Added
- Initial development version of NEXO.
- Dashboard and main application layout.
- Sidebar navigation.
- Initial Tasks, Letters, Messages, and Settings pages.

### Notes
- This is an early development version.
- Features may be incomplete and subject to change.
