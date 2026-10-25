export type StorageReadResult =
  | { ok: true; found: false; value: undefined }
  | { ok: true; found: true; value: unknown }
  | { ok: false; reason: "invalid_json" | "read_failed" };

export type StorageWriteResult =
  | { ok: true }
  | { ok: false; reason: "write_failed" };

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function readJSON(storage: StorageLike, key: string): StorageReadResult;
export function writeJSON(storage: StorageLike, key: string, value: unknown): StorageWriteResult;
