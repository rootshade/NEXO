/**
 * Stable creator identity check for tasks.
 * Legacy tasks without createdById remain compatible through the caller's
 * explicit legacy-name fallback; this helper itself never trusts display names.
 */
function isTaskCreatedBy(task, user) {
  if (!task || !user || typeof user.id !== "string" || typeof task.createdById !== "string") {
    return false;
  }
  return task.createdById === user.id;
}

module.exports = { isTaskCreatedBy };
