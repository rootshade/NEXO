import type { Task } from "./tasks";

export function isTask(value: unknown): value is Task;
export function isTaskList(value: unknown): value is Task[];
