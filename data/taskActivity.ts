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

function readAllActivities(): TaskActivity[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as TaskActivity[]) : [];
  } catch {
    return [];
  }
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
    id: Date.now(),
    taskId,
    type,
    actor,
    message,
    createdAt: new Date().toISOString(),
  };

  const activities = readAllActivities();
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([...activities, activity])
  );
  window.dispatchEvent(new CustomEvent(TASK_ACTIVITY_EVENT));

  return activity;
}
