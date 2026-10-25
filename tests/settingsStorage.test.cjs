const test = require("node:test");
const assert = require("node:assert/strict");
const {
  isSettings,
  isDeveloperProfile,
  readValidatedJSON,
  writeValidatedJSON,
} = require("../data/settingsStorage.cjs");

const settings = {
  fullName: "Mohammad",
  email: "mohammad@nexo.local",
  language: "English",
  notifications: true,
};
const profile = { fullName: "Mohammad", githubUsername: "rootshade", githubUrl: "https://github.com/rootshade" };

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem(key) { return Object.hasOwn(data, key) ? data[key] : null; },
    setItem(key, value) { data[key] = value; },
  };
}

test("validates settings and developer profile shapes", () => {
  assert.equal(isSettings(settings), true);
  assert.equal(isSettings({ ...settings, notifications: "yes" }), false);
  assert.equal(isDeveloperProfile(profile), true);
  assert.equal(isDeveloperProfile({ ...profile, githubUrl: null }), false);
  assert.equal(isSettings([]), false);
});

test("reads valid saved values without changing storage", () => {
  const raw = JSON.stringify(settings);
  const storage = memoryStorage({ "nexo-settings": raw });
  assert.deepEqual(readValidatedJSON(storage, "nexo-settings", isSettings), { ok: true, found: true, value: settings });
  assert.equal(storage.data["nexo-settings"], raw);
});

test("preserves malformed JSON and invalid data", () => {
  const malformed = "{broken";
  const invalid = JSON.stringify({ ...settings, notifications: "yes" });
  const storage = memoryStorage({ malformed, "nexo-settings": invalid });
  assert.deepEqual(readValidatedJSON(storage, "malformed", isSettings), { ok: false, reason: "invalid_json" });
  assert.deepEqual(readValidatedJSON(storage, "nexo-settings", isSettings), { ok: false, reason: "invalid_data" });
  assert.equal(storage.data.malformed, malformed);
  assert.equal(storage.data["nexo-settings"], invalid);
});

test("distinguishes missing keys and storage read failures", () => {
  assert.deepEqual(readValidatedJSON(memoryStorage(), "missing", isSettings), { ok: true, found: false, value: undefined });
  assert.deepEqual(readValidatedJSON({ getItem() { throw Error("blocked"); } }, "x", isSettings), { ok: false, reason: "read_failed" });
});

test("writes only validated values and reports write failures", () => {
  const storage = memoryStorage();
  assert.deepEqual(writeValidatedJSON(storage, "nexo-settings", settings, isSettings), { ok: true });
  assert.equal(storage.data["nexo-settings"], JSON.stringify(settings));
  assert.deepEqual(writeValidatedJSON(storage, "nexo-settings", { ...settings, notifications: "yes" }, isSettings), { ok: false, reason: "invalid_data" });
  assert.deepEqual(writeValidatedJSON({ setItem() { throw Error("quota"); } }, "nexo-settings", settings, isSettings), { ok: false, reason: "write_failed" });
});
