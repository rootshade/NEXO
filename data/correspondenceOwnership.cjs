function matchesLegacyName(participant, userName) {
  if (typeof participant !== "string" || typeof userName !== "string") return false;
  const person = participant.trim().toLowerCase();
  const name = userName.trim().toLowerCase();
  return Boolean(person && name) &&
    (person === name || person.startsWith(`${name} `) || name.startsWith(`${person} `));
}

/**
 * Prefer stable participant IDs whenever the record has them.
 * Name matching is retained only for older records that have no participant IDs.
 */
function canViewCorrespondenceRecord(record, user) {
  if (!record || !user || user.status !== "Active" || typeof user.id !== "string") return false;
  const hasStableIdentity = typeof record.senderId === "string" || typeof record.receiverId === "string";
  if (hasStableIdentity) {
    return record.senderId === user.id || record.receiverId === user.id;
  }
  return matchesLegacyName(record.sender, user.name) || matchesLegacyName(record.receiver, user.name);
}

function isCorrespondenceRecipientRecord(record, user) {
  if (!record || !user || user.status !== "Active" || typeof user.id !== "string") return false;
  if (typeof record.senderId === "string" || typeof record.receiverId === "string") {
    return record.receiverId === user.id;
  }
  return matchesLegacyName(record.receiver, user.name);
}

function isCorrespondenceSenderRecord(record, user) {
  if (!record || !user || user.status !== "Active" || typeof user.id !== "string") return false;
  if (typeof record.senderId === "string" || typeof record.receiverId === "string") {
    return record.senderId === user.id;
  }
  return matchesLegacyName(record.sender, user.name);
}

module.exports = {
  canViewCorrespondenceRecord,
  isCorrespondenceRecipientRecord,
  isCorrespondenceSenderRecord,
};
