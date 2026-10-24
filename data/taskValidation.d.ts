import type { Task } from "./tasks";

export function isValidDate(value: unknown): boolean;
export function isTask(value: unknown): value is Task;
export function isTaskList(value: unknown): value is Task[];
