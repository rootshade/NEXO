const test = require("node:test");
const assert = require("node:assert/strict");
const { isTask, isTaskList } = require("../data/taskValidation.js");

const validTask = {
  id: 1,
  title: "Test task",
  description: "Validation fixture",
  status: "Pending",
  priority: "High",
  assignedTo: "Mohammad",
  createdBy: "Mohammad",
  createdAt: "2026-10-22",
  deadline: "2026-10-30",
};

test("accepts a valid task", () => {
  assert.equal(isTask(validTask), true);
  assert.equal(isTaskList([validTask]), true);
});

test("rejects a negative ID", () => {
  assert.equal(isTask({ ...validTask, id: -1 }), false);
});

test("rejects an invalid status", () => {
  assert.equal(isTask({ ...validTask, status: "Invalid" }), false);
});

test("rejects a malformed date", () => {
  assert.equal(isTask({ ...validTask, deadline: "30-10-2026" }), false);
});

test("rejects impossible calendar dates", () => {
  assert.equal(isTask({ ...validTask, deadline: "2026-02-30" }), false);
  assert.equal(isTask({ ...validTask, createdAt: "2026-13-01" }), false);
});

test("accepts leap-day dates only in leap years", () => {
  assert.equal(isTask({ ...validTask, deadline: "2024-02-29" }), true);
  assert.equal(isTask({ ...validTask, deadline: "2025-02-29" }), false);
});

test("rejects duplicate task IDs", () => {
  assert.equal(isTaskList([validTask, { ...validTask, title: "Duplicate" }]), false);
});

test("rejects non-task values and non-arrays", () => {
  assert.equal(isTask(null), false);
  assert.equal(isTaskList({ task: validTask }), false);
});
