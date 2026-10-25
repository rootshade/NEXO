import type { StorageReadResult, StorageWriteResult, StorageLike } from "./safeStorage.cjs";

export type SettingsRecord = { fullName: string; email: string; language: string; notifications: boolean };
export type DeveloperProfileRecord = { fullName: string; githubUsername: string; githubUrl: string };
export function isSettings(value: unknown): value is SettingsRecord;
export function isDeveloperProfile(value: unknown): value is DeveloperProfileRecord;
export function readValidatedJSON<T>(storage: StorageLike, key: string, validator: (value: unknown) => value is T): StorageReadResult;
export function writeValidatedJSON<T>(storage: StorageLike, key: string, value: T, validator: (value: unknown) => value is T): StorageWriteResult;
