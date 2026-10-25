/**
 * Client-side ownership checks for task comments.
 *
 * This is a UX/data-integrity safeguard for the localStorage prototype,
 * not an authorization boundary. Production authorization must run on the server.
 */
function canManageTaskComment(comment, currentUser) {
  if (
    !comment ||
    !currentUser ||
    currentUser.status !== "Active" ||
    typeof currentUser.id !== "string" ||
    !currentUser.id
  ) {
    return false;
  }

  // New comments use stable user IDs rather than mutable display names.
  if (typeof comment.authorId === "string" && comment.authorId.length > 0) {
    return comment.authorId === currentUser.id;
  }

  // Backward compatibility for comments saved before authorId was introduced.
  // This fallback is not secure against duplicate names and should disappear
  // after a future, explicit migration of legacy comment records.
  return (
    typeof comment.author === "string" &&
    typeof currentUser.name === "string" &&
    comment.author.trim().toLocaleLowerCase() ===
      currentUser.name.trim().toLocaleLowerCase()
  );
}

module.exports = { canManageTaskComment };
