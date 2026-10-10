"use client";

import { tasks as initialTasks } from "./tasks";
import type {
  Task,
  TaskPriority,
  TaskStatus,
} from "./tasks";

let taskList: Task[] = [...initialTasks];

export function getTasks(): Task[] {
  return taskList;
}

export function getTaskById(id: number): Task | undefined {
  return taskList.find((task) => task.id === id);
}

export function createTask(data: {
  title: string;
  description: string;
  priority: TaskPriority;
  assignedTo: string;
  deadline: string;
}): Task {
  const newId =
    taskList.length > 0
      ? Math.max(...taskList.map((task) => task.id)) + 1
      : 1;

  const newTask: Task = {
    id: newId,
    title: data.title,
    description: data.description,
    status: "Pending",
    priority: data.priority,
    assignedTo: data.assignedTo,
    createdAt: new Date().toISOString().split("T")[0],
    deadline: data.deadline,
  };

  taskList = [newTask, ...taskList];

  return newTask;
}

export function updateTask(
  id: number,
  data: Partial<Omit<Task, "id">>
): Task | undefined {
  const index = taskList.findIndex(
    (task) => task.id === id
  );

  if (index === -1) {
    return undefined;
  }

  taskList[index] = {
    ...taskList[index],
    ...data,
  };

  return taskList[index];
}

export function deleteTask(id: number): boolean {
  const exists = taskList.some(
    (task) => task.id === id
  );

  if (!exists) {
    return false;
  }

  taskList = taskList.filter(
    (task) => task.id !== id
  );

  return true;
}

export function updateTaskStatus(
  id: number,
  status: TaskStatus
): Task | undefined {
  return updateTask(id, { status });
}
