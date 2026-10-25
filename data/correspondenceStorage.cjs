const { readJSON, writeJSON } = require("./safeStorage.cjs");

function isAttachment(value) {
  return !!value &&
    typeof value === "object" &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.type === "string" &&
    typeof value.size === "number" &&
    Number.isFinite(value.size) &&
    typeof value.dataUrl === "string";
}

function isMessageRecord(value) {
  return !!value &&
    typeof value === "object" &&
    typeof value.id === "number" &&
    Number.isFinite(value.id) &&
    typeof value.sender === "string" &&
    typeof value.receiver === "string" &&
    (value.senderId === undefined || typeof value.senderId === "string") &&
    (value.receiverId === undefined || typeof value.receiverId === "string") &&
    typeof value.subject === "string" &&
    typeof value.content === "string" &&
    typeof value.date === "string" &&
    (value.status === "Unread" || value.status === "Read") &&
    (value.attachments === undefined ||
      (Array.isArray(value.attachments) && value.attachments.every(isAttachment)));
}

function isLetterRecord(value) {
  return !!value &&
    typeof value === "object" &&
    typeof value.id === "number" &&
    Number.isFinite(value.id) &&
    typeof value.subject === "string" &&
    typeof value.sender === "string" &&
    typeof value.receiver === "string" &&
    (value.senderId === undefined || typeof value.senderId === "string") &&
    (value.receiverId === undefined || typeof value.receiverId === "string") &&
    typeof value.date === "string" &&
    (value.status === "Unread" || value.status === "Read" || value.status === "Sent") &&
    typeof value.content === "string" &&
    (value.attachments === undefined ||
      (Array.isArray(value.attachments) && value.attachments.every(isAttachment)));
}

function readArray(storage, key, isRecord) {
  const result = readJSON(storage, key);
  if (!result.ok) return result;
  if (!result.found) return { ok: true, found: false, value: undefined };
  if (!Array.isArray(result.value) || !result.value.every(isRecord)) {
    return { ok: false, reason: "invalid_data" };
  }
  return { ok: true, found: true, value: result.value };
}

function writeArray(storage, key, records, isRecord) {
  if (!Array.isArray(records) || !records.every(isRecord)) {
    return { ok: false, reason: "invalid_data" };
  }
  return writeJSON(storage, key, records);
}

module.exports = { isMessageRecord, isLetterRecord, readArray, writeArray };
