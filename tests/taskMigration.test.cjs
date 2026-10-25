const test = require("node:test");
const assert = require("node:assert/strict");
const { findUniqueUserByName, migrateLegacyTaskIdentity } = require("../data/taskMigration.cjs");

const users = [
  { id: "user-mohammad", name: "Mohammad" },
  { id: "user-ali", name: "Ali" },
  { id: "user-sara", name: "Sara" },
];

test("backfills creator and assignee IDs when names uniquely identify users", () => {
  const migrated = migrateLegacyTaskIdentity(
    { id: 1, assignedTo: "Ali", createdBy: "Mohammad" },
    users
  );
  assert.equal(migrated.assignedToId, "user-ali");
  assert.equal(migrated.createdById, "user-mohammad");
});

test("does not guess when multiple users share a display name", () => {
  const duplicatedUsers = [...users, { id: "user-ali-2", name: "Ali" }];
  assert.equal(findUniqueUserByName("Ali", duplicatedUsers), undefined);
  const migrated = migrateLegacyTaskIdentity(
    { id: 2, assignedTo: "Ali", createdBy: "Ali" },
    duplicatedUsers
  );
  assert.equal(migrated.assignedToId, undefined);
  assert.equal(migrated.createdById, undefined);
});

test("preserves already stored stable IDs", () => {
  const migrated = migrateLegacyTaskIdentity(
    { id: 3, assignedTo: "Old Name", assignedToId: "user-ali", createdBy: "Former Name", createdById: "user-sara" },
    users
  );
  assert.equal(migrated.assignedToId, "user-ali");
  assert.equal(migrated.createdById, "user-sara");
});

test("fills missing creator label with the legacy workspace owner name", () => {
  const migrated = migrateLegacyTaskIdentity({ id: 4, assignedTo: "Ali" }, users);
  assert.equal(migrated.createdBy, "Mohammad");
  assert.equal(migrated.createdById, "user-mohammad");
});

test("normalizes legacy display names before matching", () => {
  assert.equal(findUniqueUserByName("  aLI ", users)?.id, "user-ali");
});
