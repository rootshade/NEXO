const test = require("node:test");
const assert = require("node:assert/strict");
const { isMessageRecord, isLetterRecord, readArray, writeArray } = require("../data/correspondenceStorage.cjs");

const message = { id: 1, sender: "A", receiver: "B", subject: "Hi", content: "Text", date: "2026-10-25", status: "Unread" };
const letter = { id: 2, subject: "Purchase", sender: "A", receiver: "B", date: "2026-10-25", status: "Sent", content: "Please review" };

function memoryStorage(initial = {}) {
  const data = { ...initial };
  return {
    data,
    getItem(key) { return Object.hasOwn(data, key) ? data[key] : null; },
    setItem(key, value) { data[key] = value; },
  };
}

test("validates message and letter records", () => {
  assert.equal(isMessageRecord(message), true);
  assert.equal(isMessageRecord({ ...message, status: "Broken" }), false);
  assert.equal(isLetterRecord(letter), true);
  assert.equal(isLetterRecord({ ...letter, id: "2" }), false);
});

test("reads a valid array without changing its stored value", () => {
  const storage = memoryStorage({ messages: JSON.stringify([message]) });
  assert.deepEqual(readArray(storage, "messages", isMessageRecord), { ok: true, found: true, value: [message] });
  assert.equal(storage.data.messages, JSON.stringify([message]));
});

test("reports malformed JSON without deleting or replacing it", () => {
  const storage = memoryStorage({ messages: "{broken" });
  assert.deepEqual(readArray(storage, "messages", isMessageRecord), { ok: false, reason: "invalid_json" });
  assert.equal(storage.data.messages, "{broken");
});

test("reports invalid record shapes without deleting stored data", () => {
  const invalid = JSON.stringify([{ ...message, status: "Broken" }]);
  const storage = memoryStorage({ messages: invalid });
  assert.deepEqual(readArray(storage, "messages", isMessageRecord), { ok: false, reason: "invalid_data" });
  assert.equal(storage.data.messages, invalid);
});

test("reports missing storage keys distinctly", () => {
  assert.deepEqual(readArray(memoryStorage(), "messages", isMessageRecord), { ok: true, found: false, value: undefined });
});

test("handles storage read and write failures", () => {
  assert.deepEqual(readArray({ getItem() { throw Error("blocked"); } }, "messages", isMessageRecord), { ok: false, reason: "read_failed" });
  assert.deepEqual(writeArray({ setItem() { throw Error("quota"); } }, "messages", [message], isMessageRecord), { ok: false, reason: "write_failed" });
});

test("refuses to persist invalid records and writes valid records", () => {
  const storage = memoryStorage();
  assert.deepEqual(writeArray(storage, "messages", [{ ...message, status: "Broken" }], isMessageRecord), { ok: false, reason: "invalid_data" });
  assert.deepEqual(writeArray(storage, "messages", [message], isMessageRecord), { ok: true });
  assert.equal(storage.data.messages, JSON.stringify([message]));
});
