import type { Message } from "./messages";
import type { Letter } from "./letters";
import type { StorageReadResult, StorageWriteResult, StorageLike } from "./safeStorage.cjs";

export function isMessageRecord(value: unknown): value is Message;
export function isLetterRecord(value: unknown): value is Letter;
export function readArray<T>(storage: StorageLike, key: string, isRecord: (value: unknown) => value is T): StorageReadResult & { value?: unknown };
export function writeArray<T>(storage: StorageLike, key: string, records: T[], isRecord: (value: unknown) => value is T): StorageWriteResult;
