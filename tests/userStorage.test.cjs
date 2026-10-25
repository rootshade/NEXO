const test = require("node:test");
const assert = require("node:assert/strict");
const { isUserRecord, isUsers, readUsers, writeUsers } = require("../data/userStorage.cjs");

const validUsers = [
  { id: "user-1", name: "Alex", email: "alex@example.com", role: "User", status: "Active", createdAt: "2026-01-01" },
  { id: "user-2", name: "Sam", email: "sam@example.com", role: "Manager", status: "Inactive", createdAt: "2026-01-02" },
];

function makeStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, value); },
    data,
  };
}

test("validates required user fields and status values", () => {
  assert.equal(isUserRecord(validUsers[0]), true);
  assert.equal(isUserRecord({ ...validUsers[0], status: "Deleted" }), false);
  assert.equal(isUserRecord({ ...validUsers[0], id: " " }), false);
  assert.equal(isUserRecord(null), false);
});

test("accepts valid user lists and rejects duplicate IDs or emails", () => {
  assert.equal(isUsers(validUsers), true);
  assert.equal(isUsers([validUsers[0], { ...validUsers[1], id: validUsers[0].id }]), false);
  assert.equal(isUsers([validUsers[0], { ...validUsers[1], email: " ALEX@example.com " }]), false);
  assert.equal(isUsers({}), false);
});

test("reads valid users without changing their data", () => {
  const storage = makeStorage({ users: JSON.stringify(validUsers) });
  const result = readUsers(storage, "users", []);
  assert.deepEqual(result, { ok: true, found: true, value: validUsers });
});

test("returns fallback users for a missing key", () => {
  const fallback = [validUsers[0]];
  assert.deepEqual(readUsers(makeStorage(), "users", fallback), {
    ok: true, found: false, value: fallback,
  });
});

test("does not overwrite malformed JSON or invalid user data", () => {
  const malformed = makeStorage({ users: "{broken" });
  assert.deepEqual(readUsers(malformed, "users", []), { ok: false, reason: "invalid_json" });
  assert.equal(malformed.data.get("users"), "{broken");

  const invalid = makeStorage({ users: JSON.stringify([{ ...validUsers[0], status: "unknown" }]) });
  assert.deepEqual(readUsers(invalid, "users", []), { ok: false, reason: "invalid_data" });
  assert.equal(invalid.data.get("users"), JSON.stringify([{ ...validUsers[0], status: "unknown" }]));
});

test("reports storage read and write failures", () => {
  const readFailure = { getItem() { throw new Error("blocked"); } };
  assert.deepEqual(readUsers(readFailure, "users", []), { ok: false, reason: "read_failed" });

  const writeFailure = { setItem() { throw new Error("quota"); } };
  assert.deepEqual(writeUsers(writeFailure, "users", validUsers), { ok: false, reason: "write_failed" });
});

test("writes only valid user lists", () => {
  const storage = makeStorage();
  assert.deepEqual(writeUsers(storage, "users", validUsers), { ok: true });
  assert.equal(storage.data.get("users"), JSON.stringify(validUsers));
  assert.deepEqual(writeUsers(storage, "users", [{ ...validUsers[0], role: "" }]), {
    ok: false, reason: "invalid_data",
  });
});
