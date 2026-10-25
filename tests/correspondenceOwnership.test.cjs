const test = require("node:test");
const assert = require("node:assert/strict");
const {
  canViewCorrespondenceRecord,
  isCorrespondenceRecipientRecord,
  isCorrespondenceSenderRecord,
} = require("../data/correspondenceOwnership.cjs");

const ali = { id: "user-ali", name: "Alex", status: "Active" };
const otherAlex = { id: "user-other", name: "Alex", status: "Active" };

test("stable participant IDs prevent access through duplicate display names", () => {
  const record = { sender: "Alex", receiver: "Morgan", senderId: "user-ali", receiverId: "user-morgan" };
  assert.equal(canViewCorrespondenceRecord(record, ali), true);
  assert.equal(canViewCorrespondenceRecord(record, otherAlex), false);
});

test("recipient and sender checks use stable IDs when present", () => {
  const record = { sender: "Alex", receiver: "Morgan", senderId: "user-ali", receiverId: "user-morgan" };
  assert.equal(isCorrespondenceSenderRecord(record, ali), true);
  assert.equal(isCorrespondenceRecipientRecord(record, ali), false);
  assert.equal(isCorrespondenceRecipientRecord(record, { id: "user-morgan", name: "Morgan", status: "Active" }), true);
});

test("legacy records keep name-based compatibility", () => {
  const record = { sender: "Ali Ahmadi", receiver: "Mohammad" };
  assert.equal(canViewCorrespondenceRecord(record, { id: "user-ali", name: "Ali", status: "Active" }), true);
});

test("inactive users are denied even if their ID matches", () => {
  const record = { sender: "Alex", receiver: "Morgan", senderId: "user-ali", receiverId: "user-morgan" };
  assert.equal(canViewCorrespondenceRecord(record, { ...ali, status: "Inactive" }), false);
});
