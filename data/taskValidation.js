/** @typedef {"Pending" | "In Progress" | "Completed"} TaskStatus */
/** @typedef {"Low" | "Medium" | "High"} TaskPriority */

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
    typeof task.createdAt === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(task.createdAt) &&
    typeof task.deadline === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(task.deadline) &&
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
