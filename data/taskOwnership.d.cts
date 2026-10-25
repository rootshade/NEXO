import type { AccessUser } from "./accessControl";
import type { Task } from "./tasks";

export function isTaskCreatedBy(
  task: Pick<Task, "createdById">,
  user: Pick<AccessUser, "id">
): boolean;
