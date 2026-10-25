/**
 * Validated storage helpers for the NEXO user directory.
 * Browser storage is untrusted input; this does not provide server authorization.
 */
const { readJSON, writeJSON } = require("./safeStorage.cjs");

const USER_STATUSES = new Set(["Active", "Inactive"]);

function isUserRecord(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    typeof value.id === "string" &&
    value.id.trim().length > 0 &&
    typeof value.name === "string" &&
    value.name.trim().length > 0 &&
    typeof value.email === "string" &&
    value.email.trim().length > 0 &&
    typeof value.role === "string" &&
    value.role.trim().length > 0 &&
    USER_STATUSES.has(value.status) &&
    typeof value.createdAt === "string" &&
    value.createdAt.trim().length > 0
  );
}

function isUsers(value) {
  if (!Array.isArray(value)) return false;
  if (!value.every(isUserRecord)) return false;

  const ids = new Set();
  const emails = new Set();
  for (const user of value) {
    const email = user.email.trim().toLowerCase();
    if (ids.has(user.id) || emails.has(email)) return false;
    ids.add(user.id);
    emails.add(email);
  }
  return true;
}

function readUsers(storage, key, fallbackUsers) {
  const result = readJSON(storage, key);
  if (!result.ok) return result;
  if (!result.found) return { ok: true, found: false, value: fallbackUsers };
  if (!isUsers(result.value)) return { ok: false, reason: "invalid_data" };
  return { ok: true, found: true, value: result.value };
}

function writeUsers(storage, key, users) {
  if (!isUsers(users)) return { ok: false, reason: "invalid_data" };
  return writeJSON(storage, key, users);
}

module.exports = { isUserRecord, isUsers, readUsers, writeUsers };
