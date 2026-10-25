const test = require("node:test");
const assert = require("node:assert/strict");
const { isTaskAssignedTo } = require("../data/taskAssignment.cjs");

test("matches task assignee by stable account ID", () => {
  assert.equal(
    isTaskAssignedTo({ assignedToId: "user-ali", assignedTo: "Ali" }, { id: "user-ali", name: "Ali" }),
    true
  );
});

test("does not confuse users who share a display name", () => {
  assert.equal(
    isTaskAssignedTo({ assignedToId: "user-ali", assignedTo: "Alex" }, { id: "user-other", name: "Alex" }),
    false
  );
});

test("does not use display names when stable assignee ID is missing or malformed", () => {
  assert.equal(isTaskAssignedTo({ assignedTo: "Mohammad" }, { id: "user-mohammad" }), false);
  assert.equal(isTaskAssignedTo({ assignedToId: 12 }, { id: "user-mohammad" }), false);
  assert.equal(isTaskAssignedTo(null, { id: "user-mohammad" }), false);
});
