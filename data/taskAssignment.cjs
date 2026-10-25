/**
 * Stable assignee identity check. Display names are intentionally not used here.
 * Callers may use a legacy-name fallback only when assignedToId is absent.
 */
function isTaskAssignedTo(task, user) {
  if (!task || !user || typeof user.id !== "string" || typeof task.assignedToId !== "string") {
    return false;
  }
  return task.assignedToId === user.id;
}

/**
 * Resolve an account only when its stable ID matches and the account is active.
 * Names are deliberately not accepted as identifiers.
 */
function findActiveAssignee(users, assignedToId) {
  if (!Array.isArray(users) || typeof assignedToId !== "string" || !assignedToId) {
    return undefined;
  }
  return users.find((user) =>
    user &&
    user.id === assignedToId &&
    user.status === "Active" &&
    typeof user.name === "string" &&
    user.name.trim().length > 0
  );
}

module.exports = { isTaskAssignedTo, findActiveAssignee };
