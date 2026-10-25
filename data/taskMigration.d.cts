import type { AccessUser } from "./accessControl";
import type { Task } from "./tasks";

export function findUniqueUserByName(
  name: unknown,
  users: readonly Pick<AccessUser, "id" | "name">[]
): Pick<AccessUser, "id" | "name"> | undefined;

export function migrateLegacyTaskIdentity<T extends Partial<Task>>(
  task: T,
  users: readonly Pick<AccessUser, "id" | "name">[]
): T & { createdBy: string };
