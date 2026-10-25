/**
 * Pure task-visibility policy. The caller supplies whether the user has the
 * tasks.view permission so this rule can be tested without browser storage.
 */
function canUserViewTask(task, user, hasViewPermission) {
  if (!task || !user || user.status !== "Active" || !hasViewPermission) {
    return false;
  }

  const sameName = (left, right) =>
    typeof left === "string" &&
    typeof right === "string" &&
    left.trim().toLowerCase() === right.trim().toLowerCase();

  const hasCreatorId = typeof task.createdById === "string" && task.createdById.length > 0;
  const isCreator = hasCreatorId
    ? task.createdById === user.id
    : sameName(task.createdBy, user.name);

  if (user.role === "Super Admin") return isCreator;

  const hasAssigneeId = typeof task.assignedToId === "string" && task.assignedToId.length > 0;
  const isAssignee = hasAssigneeId
    ? task.assignedToId === user.id
    : sameName(task.assignedTo, user.name);

  return isCreator || isAssignee;
}

module.exports = { canUserViewTask };
