const { readJSON, writeJSON } = require("./safeStorage.cjs");

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isSettings(value) {
  return isRecord(value) &&
    typeof value.fullName === "string" &&
    typeof value.email === "string" &&
    typeof value.language === "string" &&
    typeof value.notifications === "boolean";
}

function isDeveloperProfile(value) {
  return isRecord(value) &&
    typeof value.fullName === "string" &&
    typeof value.githubUsername === "string" &&
    typeof value.githubUrl === "string";
}

function readValidatedJSON(storage, key, validator) {
  const result = readJSON(storage, key);
  if (!result.ok || !result.found) return result;
  if (!validator(result.value)) return { ok: false, reason: "invalid_data" };
  return result;
}

function writeValidatedJSON(storage, key, value, validator) {
  if (!validator(value)) return { ok: false, reason: "invalid_data" };
  return writeJSON(storage, key, value);
}

module.exports = {
  isSettings,
  isDeveloperProfile,
  readValidatedJSON,
  writeValidatedJSON,
};
