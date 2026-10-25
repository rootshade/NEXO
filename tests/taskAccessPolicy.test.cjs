const test = require("node:test");
const assert = require("node:assert/strict");
const { canUserViewTask } = require("../data/taskAccessPolicy.cjs");

const activeUser = (overrides = {}) => ({
  id: "user-ali",
  name: "Ali",
  role: "User",
  status: "Active",
  ...overrides,
});

test("allows an active assigned user when task view permission is granted", () => {
  assert.equal(
    canUserViewTask({ assignedTo: "Ali", assignedToId: "user-ali", createdBy: "Sara", createdById: "user-sara" }, activeUser(), true),
    true
  );
});

test("stable assignee ID takes precedence over matching display name", () => {
  assert.equal(
    canUserViewTask({ assignedTo: "Ali", assignedToId: "user-other", createdBy: "Sara", createdById: "user-sara" }, activeUser(), true),
    false
  );
});

test("stable creator ID preserves ownership after the display name changes", () => {
  assert.equal(
    canUserViewTask({ assignedTo: "Sara", assignedToId: "user-sara", createdBy: "Old Name", createdById: "user-ali" }, activeUser(), true),
    true
  );
});

test("denies inactive accounts even when they are the creator or super admin", () => {
  assert.equal(
    canUserViewTask({ assignedTo: "Ali", assignedToId: "user-ali", createdBy: "Ali", createdById: "user-ali" }, activeUser({ status: "Inactive" }), true),
    false
  );
  assert.equal(
    canUserViewTask({ assignedTo: "Mohammad", createdBy: "Mohammad", createdById: "user-mohammad" }, activeUser({ id: "user-mohammad", name: "Mohammad", role: "Super Admin", status: "Inactive" }), true),
    false
  );
});

test("Super Admin can view only tasks they created", () => {
  const admin = activeUser({ id: "user-mohammad", name: "Mohammad", role: "Super Admin" });
  assert.equal(canUserViewTask({ assignedTo: "Mohammad", createdBy: "Ali", createdById: "user-ali" }, admin, true), false);
  assert.equal(canUserViewTask({ assignedTo: "Ali", createdBy: "Mohammad", createdById: "user-mohammad" }, admin, true), true);
});

test("denies access when task-view permission is missing", () => {
  assert.equal(canUserViewTask({ assignedTo: "Ali", assignedToId: "user-ali" }, activeUser(), false), false);
});

test("legacy tasks retain name-based fallback only when stable IDs are absent", () => {
  assert.equal(canUserViewTask({ assignedTo: "Ali", createdBy: "Sara" }, activeUser(), true), true);
  assert.equal(canUserViewTask({ assignedTo: "Ali", assignedToId: "user-other" }, activeUser(), true), false);
});
