import type { StorageLike } from "./safeStorage.cjs";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Inactive";
  createdAt: string;
};

export type UserReadResult =
  | { ok: true; found: false; value: UserRecord[] }
  | { ok: true; found: true; value: UserRecord[] }
  | { ok: false; reason: "invalid_json" | "read_failed" | "invalid_data" };

export type UserWriteResult =
  | { ok: true }
  | { ok: false; reason: "write_failed" | "invalid_data" };

export function isUserRecord(value: unknown): value is UserRecord;
export function isUsers(value: unknown): value is UserRecord[];
export function readUsers(
  storage: StorageLike,
  key: string,
  fallbackUsers: UserRecord[]
): UserReadResult;
export function writeUsers(
  storage: StorageLike,
  key: string,
  users: UserRecord[]
): UserWriteResult;
