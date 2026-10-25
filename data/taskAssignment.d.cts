import type { AccessUser } from "./accessControl";

export function isTaskAssignedTo(
  task: { assignedToId?: string } | null | undefined,
  user: Pick<AccessUser, "id"> | null | undefined
): boolean;
