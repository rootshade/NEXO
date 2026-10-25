import type { AccessUser } from "./accessControl";
import type { Task } from "./tasks";

export function canUserViewTask(
  task: Pick<Task, "assignedTo" | "assignedToId" | "createdBy" | "createdById"> | null | undefined,
  user: Pick<AccessUser, "id" | "name" | "role" | "status"> | null | undefined,
  hasViewPermission: boolean
): boolean;
