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

module.exports = { isTaskAssignedTo };
