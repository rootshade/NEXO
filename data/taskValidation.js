/** @typedef {"Pending" | "In Progress" | "Completed"} TaskStatus */
/** @typedef {"Low" | "Medium" | "High"} TaskPriority */

/**
 * Check that a string is a real calendar date in YYYY-MM-DD format.
 * @param {unknown} value
 * @returns {boolean}
 */
function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/**
 * Validate a task object read from browser storage.
 * @param {unknown} value
 * @returns {boolean}
 */
function isTask(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const task = value;
  return (
    typeof task.id === "number" &&
    Number.isSafeInteger(task.id) &&
    task.id > 0 &&
    typeof task.title === "string" &&
    typeof task.description === "string" &&
    (task.status === "Pending" || task.status === "In Progress" || task.status === "Completed") &&
    (task.priority === "Low" || task.priority === "Medium" || task.priority === "High") &&
    typeof task.assignedTo === "string" &&
    isValidDate(task.createdAt) &&
    isValidDate(task.deadline) &&
    (task.createdBy === undefined || typeof task.createdBy === "string")
  );
}

/**
 * Validate a saved task array and reject duplicate IDs.
 * @param {unknown} value
 * @returns {boolean}
 */
function isTaskList(value) {
  if (!Array.isArray(value) || !value.every(isTask)) return false;
  const ids = value.map((task) => task.id);
  return new Set(ids).size === ids.length;
}

module.exports = { isTask, isTaskList };
