"use client";

import { tasks as initialTasks } from "./tasks";
import { addTaskActivity } from "./taskActivity";
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
  addTaskActivity(newTask.id, "task_created", `Task created: ${newTask.title}`);

  return newTask;
}

export function updateTask(
  id: number,
  data: Partial<Omit<Task, "id">>
): Task | undefined {
  const index = taskList.findIndex((task) => task.id === id);

  if (index === -1) {
    return undefined;
  }

  const previousTask = taskList[index];
  const updatedTask = {
    ...previousTask,
    ...data,
  };

  taskList[index] = updatedTask;

  if (data.status && data.status !== previousTask.status) {
    addTaskActivity(
      id,
      "status_changed",
      `Status changed from ${previousTask.status} to ${updatedTask.status}`
    );
  }

  const changedFields = Object.keys(data).filter((key) => {
    const field = key as keyof Omit<Task, "id">;
    return data[field] !== undefined && data[field] !== previousTask[field];
  });

  if (changedFields.some((field) => field !== "status")) {
    addTaskActivity(id, "task_updated", "Task details updated");
  }

  return updatedTask;
}

export function deleteTask(id: number): boolean {
  const task = taskList.find((item) => item.id === id);

  if (!task) {
    return false;
  }

  addTaskActivity(id, "task_deleted", `Task deleted: ${task.title}`);
  taskList = taskList.filter((item) => item.id !== id);

  return true;
}

export function updateTaskStatus(
  id: number,
  status: TaskStatus
): Task | undefined {
  return updateTask(id, { status });
}
