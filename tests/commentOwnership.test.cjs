const test = require("node:test");
const assert = require("node:assert/strict");
const { canManageTaskComment } = require("../data/commentOwnership.cjs");

const mohammad = {
  id: "user-mohammad",
  name: "Mohammad",
  status: "Active",
};
const ali = { id: "user-ali", name: "Ali", status: "Active" };

test("allows the author identified by stable user ID to manage a comment", () => {
  assert.equal(
    canManageTaskComment({ author: "Mohammad", authorId: "user-mohammad" }, mohammad),
    true
  );
});

test("does not let a different user manage a comment even if display names match", () => {
  assert.equal(
    canManageTaskComment({ author: "Mohammad", authorId: "user-mohammad" }, {
      ...ali,
      name: "Mohammad",
    }),
    false
  );
});

test("denies comment management for inactive accounts", () => {
  assert.equal(
    canManageTaskComment(
      { author: "Mohammad", authorId: "user-mohammad" },
      { ...mohammad, status: "Inactive" }
    ),
    false
  );
});

test("supports legacy comments without authorId using a case-insensitive name match", () => {
  assert.equal(
    canManageTaskComment({ author: "  MOHAMMAD " }, mohammad),
    true
  );
  assert.equal(canManageTaskComment({ author: "Ali" }, mohammad), false);
});

test("denies management when the current user or comment is missing", () => {
  assert.equal(canManageTaskComment({ author: "Mohammad" }, null), false);
  assert.equal(canManageTaskComment(null, mohammad), false);
});
