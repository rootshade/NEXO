const test = require("node:test");
const assert = require("node:assert/strict");
const { hasRolePermission } = require("../data/permissionPolicy.cjs");

test("applies the built-in permissions for each standard role", () => {
  assert.equal(hasRolePermission("Admin", "tasks.delete"), true);
  assert.equal(hasRolePermission("Manager", "tasks.edit"), true);
  assert.equal(hasRolePermission("Manager", "tasks.delete"), false);
  assert.equal(hasRolePermission("User", "tasks.view"), true);
  assert.equal(hasRolePermission("User", "tasks.create"), false);
});

test("returns false for unknown roles and permissions", () => {
  assert.equal(hasRolePermission("Custom Role", "tasks.view"), false);
  assert.equal(hasRolePermission("User", "root.access"), false);
  assert.equal(hasRolePermission("", "tasks.view"), false);
});

test("a boolean override takes precedence over the default policy", () => {
  const overrides = {
    User: {
      "tasks.create": true,
      "tasks.view": false,
    },
  };

  assert.equal(hasRolePermission("User", "tasks.create", overrides), true);
  assert.equal(hasRolePermission("User", "tasks.view", overrides), false);
});

test("supports legacy letters and messages permission keys", () => {
  const overrides = {
    User: {
      letters: false,
      messages: true,
    },
  };

  assert.equal(hasRolePermission("User", "letters.view", overrides), false);
  assert.equal(hasRolePermission("User", "letters.create", overrides), false);
  assert.equal(hasRolePermission("User", "messages.view", overrides), true);
  assert.equal(hasRolePermission("User", "messages.create", overrides), true);
});

test("an explicit modern permission overrides a legacy permission value", () => {
  const overrides = {
    User: {
      letters: true,
      "letters.view": false,
    },
  };

  assert.equal(hasRolePermission("User", "letters.view", overrides), false);
  assert.equal(hasRolePermission("User", "letters.create", overrides), true);
});

test("ignores malformed override containers and non-boolean values", () => {
  assert.equal(hasRolePermission("User", "tasks.view", []), true);
  assert.equal(hasRolePermission("User", "tasks.view", { User: [] }), true);
  assert.equal(
    hasRolePermission("User", "tasks.view", { User: { "tasks.view": "false" } }),
    true
  );
  assert.equal(hasRolePermission("User", "tasks.create", null), false);
});
