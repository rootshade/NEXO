/**
 * Safe JSON helpers for browser storage.
 * Storage is injected so failures can be tested without a real browser.
 */
function readJSON(storage, key) {
  try {
    const raw = storage.getItem(key);
    if (raw === null) return { ok: true, found: false, value: undefined };

    try {
      return { ok: true, found: true, value: JSON.parse(raw) };
    } catch {
      return { ok: false, reason: "invalid_json" };
    }
  } catch {
    return { ok: false, reason: "read_failed" };
  }
}

function writeJSON(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
    return { ok: true };
  } catch {
    return { ok: false, reason: "write_failed" };
  }
}

module.exports = { readJSON, writeJSON };
