import type { StorageLike } from "./safeStorage.cjs";

export type SettingsRecord = {
  fullName: string;
  email: string;
  language: string;
  notifications: boolean;
};
export type DeveloperProfileRecord = {
  fullName: string;
  githubUsername: string;
  githubUrl: string;
};
export type ValidatedReadResult<T> =
  | { ok: true; found: false; value: undefined }
  | { ok: true; found: true; value: T }
  | { ok: false; reason: "invalid_json" | "read_failed" | "invalid_data" };
export type ValidatedWriteResult =
  | { ok: true }
  | { ok: false; reason: "write_failed" | "invalid_data" };

export function isSettings(value: unknown): value is SettingsRecord;
export function isDeveloperProfile(value: unknown): value is DeveloperProfileRecord;
export function readValidatedJSON<T>(
  storage: StorageLike,
  key: string,
  validator: (value: unknown) => value is T
): ValidatedReadResult<T>;
export function writeValidatedJSON<T>(
  storage: StorageLike,
  key: string,
  value: T,
  validator: (value: unknown) => value is T
): ValidatedWriteResult;
