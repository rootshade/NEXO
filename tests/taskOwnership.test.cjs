const test = require("node:test");
const assert = require("node:assert/strict");
const { isTaskCreatedBy } = require("../data/taskOwnership.cjs");

test("matches task creator by stable account ID", () => {
  assert.equal(
    isTaskCreatedBy({ createdById: "user-ali", createdBy: "Ali" }, { id: "user-ali", name: "Ali" }),
    true
  );
});

test("does not treat a duplicate display name as the task creator", () => {
  assert.equal(
    isTaskCreatedBy({ createdById: "user-ali", createdBy: "Alex" }, { id: "user-another", name: "Alex" }),
    false
  );
});

test("does not grant creator ownership when stable IDs are missing or malformed", () => {
  assert.equal(isTaskCreatedBy({ createdBy: "Mohammad" }, { id: "user-mohammad" }), false);
  assert.equal(isTaskCreatedBy({ createdById: 123 }, { id: "user-mohammad" }), false);
  assert.equal(isTaskCreatedBy(null, { id: "user-mohammad" }), false);
});
