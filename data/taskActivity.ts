"use client";

export type TaskActivityType =
  | "task_created"
  | "task_updated"
  | "status_changed"
  | "task_deleted";

export type TaskActivity = {
  id: number;
  taskId: number;
  type: TaskActivityType;
  actor: string;
  message: string;
  createdAt: string;
};

const STORAGE_KEY = "nexo_task_activity";
export const TASK_ACTIVITY_EVENT = "nexo-task-activity-updated";
const CURRENT_USER = "Mohammad";

function isTaskActivity(value: unknown): value is TaskActivity {
  if (!value || typeof value !== "object") return false;
  const activity = value as Partial<TaskActivity>;
  return (
    typeof activity.id === "number" &&
    typeof activity.taskId === "number" &&
    (activity.type === "task_created" ||
      activity.type === "task_updated" ||
      activity.type === "status_changed" ||
      activity.type === "task_deleted") &&
    typeof activity.actor === "string" &&
    typeof activity.message === "string" &&
    typeof activity.createdAt === "string"
  );
}

function readAllActivities(): TaskActivity[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isTaskActivity) : [];
  } catch {
    return [];
  }
}

export function getRecentTaskActivities(limit = 10): TaskActivity[] {
  return readAllActivities()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    )
    .slice(0, limit);
}

export function getTaskActivities(taskId: number): TaskActivity[] {
  return readAllActivities()
    .filter((activity) => activity.taskId === taskId)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
    );
}

export function addTaskActivity(
  taskId: number,
  type: TaskActivityType,
  message: string,
  actor = CURRENT_USER
): TaskActivity | undefined {
  if (typeof window === "undefined") return undefined;

  const activity: TaskActivity = {
    id: Math.max(Date.now(), ...readAllActivities().map((item) => item.id + 1)),
    taskId,
    type,
    actor,
    message,
    createdAt: new Date().toISOString(),
  };

  const activities = readAllActivities();

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([...activities, activity])
    );
    window.dispatchEvent(new CustomEvent(TASK_ACTIVITY_EVENT));
    return activity;
  } catch {
    // Activity logging should never prevent the task operation itself.
    return undefined;
  }
}
