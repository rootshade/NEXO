const test = require("node:test");
const assert = require("node:assert/strict");
const { readJSON, writeJSON } = require("../data/safeStorage.cjs");

test("reads a valid JSON value", () => {
  const storage = { getItem: () => '[{"id":1}]' };
  assert.deepEqual(readJSON(storage, "tasks"), {
    ok: true,
    found: true,
    value: [{ id: 1 }],
  });
});

test("reports missing keys without treating them as errors", () => {
  assert.deepEqual(readJSON({ getItem: () => null }, "tasks"), {
    ok: true,
    found: false,
    value: undefined,
  });
});

test("reports malformed JSON and does not throw", () => {
  assert.deepEqual(readJSON({ getItem: () => "not-json" }, "tasks"), {
    ok: false,
    reason: "invalid_json",
  });
});

test("handles storage read exceptions", () => {
  const storage = { getItem: () => { throw new Error("blocked"); } };
  assert.deepEqual(readJSON(storage, "tasks"), {
    ok: false,
    reason: "read_failed",
  });
});

test("writes JSON values", () => {
  let saved;
  const storage = { setItem: (key, value) => { saved = [key, value]; } };
  assert.deepEqual(writeJSON(storage, "tasks", [{ id: 1 }]), { ok: true });
  assert.deepEqual(saved, ["tasks", '[{"id":1}]']);
});

test("handles storage write exceptions such as quota errors", () => {
  const storage = { setItem: () => { throw new Error("quota exceeded"); } };
  assert.deepEqual(writeJSON(storage, "tasks", []), {
    ok: false,
    reason: "write_failed",
  });
});
