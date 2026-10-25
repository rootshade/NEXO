/**
 * Backfill stable creator/assignee IDs for legacy tasks only when a display
 * name maps to exactly one account. Ambiguous names deliberately stay legacy.
 */
function findUniqueUserByName(name, users) {
  if (typeof name !== "string" || !Array.isArray(users)) return undefined;
  const normalized = name.trim().toLowerCase();
  if (!normalized) return undefined;
  const matches = users.filter((user) =>
    user &&
    typeof user.id === "string" &&
    typeof user.name === "string" &&
    user.name.trim().toLowerCase() === normalized
  );
  return matches.length === 1 ? matches[0] : undefined;
}

function migrateLegacyTaskIdentity(task, users) {
  if (!task || typeof task !== "object" || Array.isArray(task)) return task;

  const migrated = { ...task };
  if (typeof migrated.createdBy !== "string" || !migrated.createdBy.trim()) {
    migrated.createdBy = "Mohammad";
  }

  if (typeof migrated.createdById !== "string" || !migrated.createdById) {
    const creator = findUniqueUserByName(migrated.createdBy, users);
    if (creator) migrated.createdById = creator.id;
  }

  if (typeof migrated.assignedToId !== "string" || !migrated.assignedToId) {
    const assignee = findUniqueUserByName(migrated.assignedTo, users);
    if (assignee) migrated.assignedToId = assignee.id;
  }

  return migrated;
}

module.exports = { findUniqueUserByName, migrateLegacyTaskIdentity };
