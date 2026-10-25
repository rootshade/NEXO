/**
 * Pure role-permission policy shared by the app and Node's built-in test runner.
 * This is prototype policy logic only; localStorage-based overrides are not trusted
 * authorization for a production deployment.
 */
const DEFAULT_ROLE_PERMISSIONS = {
  Admin: [
    "dashboard",
    "tasks.view",
    "tasks.create",
    "tasks.edit",
    "tasks.delete",
    "letters.view",
    "letters.create",
    "messages.view",
    "messages.create",
    "users",
    "roles",
    "settings",
  ],
  Manager: [
    "dashboard",
    "tasks.view",
    "tasks.create",
    "tasks.edit",
    "letters.view",
    "letters.create",
    "messages.view",
    "messages.create",
    "settings",
  ],
  User: [
    "dashboard",
    "tasks.view",
    "letters.view",
    "letters.create",
    "messages.view",
    "messages.create",
    "settings",
  ],
};

const LEGACY_PERMISSION_FALLBACKS = {
  "letters.view": "letters",
  "letters.create": "letters",
  "messages.view": "messages",
  "messages.create": "messages",
};

function hasRolePermission(role, permission, overrides) {
  if (typeof role !== "string" || typeof permission !== "string") return false;

  const roleOverrides =
    overrides && typeof overrides === "object" && !Array.isArray(overrides)
      ? overrides[role]
      : null;

  if (roleOverrides && typeof roleOverrides === "object" && !Array.isArray(roleOverrides)) {
    if (typeof roleOverrides[permission] === "boolean") {
      return roleOverrides[permission];
    }

    const legacyPermission = LEGACY_PERMISSION_FALLBACKS[permission];
    if (legacyPermission && typeof roleOverrides[legacyPermission] === "boolean") {
      return roleOverrides[legacyPermission];
    }
  }

  const defaults = DEFAULT_ROLE_PERMISSIONS[role];
  if (defaults) {
    if (defaults.includes(permission)) return true;

    const legacyPermission = LEGACY_PERMISSION_FALLBACKS[permission];
    if (legacyPermission) return defaults.includes(legacyPermission);
  }

  return false;
}

module.exports = { hasRolePermission };
