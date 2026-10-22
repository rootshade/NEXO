import { tasks as initialTasks } from "./tasks";
import { isTaskList } from "./taskValidation";
import { addTaskActivity } from "./taskActivity";
import { canAccess, canViewTask, getCurrentUser } from "./accessControl";
import type {
  Task,
  TaskPriority,
  TaskStatus,
} from "./tasks";

const STORAGE_KEY = "nexo_tasks";
export const TASKS_UPDATED_EVENT = "nexo-tasks-updated";
let taskList: Task[] = [...initialTasks];

function persistTasks(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(taskList));
    window.dispatchEvent(new CustomEvent(TASKS_UPDATED_EVENT));
  } catch (error) {
    console.error("Unable to save NEXO tasks:", error);
  }
}

/** Load saved tasks once the app is running in the browser. */
export function loadTasks(): Task[] {
  if (typeof window === "undefined") return taskList;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      const parsed: unknown = JSON.parse(saved);
      if (isTaskList(parsed)) {
        // Older saved tasks predate createdBy. Attribute them to the original
        // default workspace owner so the migration does not hide existing work.
        taskList = parsed.map((task) => ({
          ...task,
          createdBy: typeof task.createdBy === "string" && task.createdBy.trim()
            ? task.createdBy
            : "Mohammad",
        }));
        if (taskList.some((task, index) => task.createdBy !== parsed[index].createdBy)) {
          persistTasks();
        }
        return [...taskList];
      }
      console.warn("Saved NEXO tasks had an invalid format; using defaults.");
    }
    taskList = [...initialTasks];
    persistTasks();
  } catch (error) {
    console.error("Unable to load NEXO tasks:", error);
    taskList = [...initialTasks];
  }

  return [...taskList];
}

export function getTasks(): Task[] {
  return typeof window === "undefined" ? [...taskList] : loadTasks();
}

export function getTaskById(id: number): Task | undefined {
  if (typeof window !== "undefined") loadTasks();
  return taskList.find((task) => task.id === id);
}

export function createTask(data: {
  title: string;
  description: string;
  priority: TaskPriority;
  assignedTo: string;
  deadline: string;
}): Task | undefined {
  if (typeof window !== "undefined" && !canAccess(getCurrentUser(), "tasks.create")) {
    return undefined;
  }

  // Re-read browser storage before every write so stale in-memory state
  // cannot overwrite tasks saved by a previous page render.
  if (typeof window !== "undefined") loadTasks();

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
    createdBy: typeof window !== "undefined" ? getCurrentUser().name : "Mohammad",
    createdAt: new Date().toISOString().split("T")[0],
    deadline: data.deadline,
  };

  taskList = [newTask, ...taskList];
  persistTasks();
  addTaskActivity(newTask.id, "task_created", `Task created: ${newTask.title}`);

  return newTask;
}

export function updateTask(
  id: number,
  data: Partial<Omit<Task, "id" | "createdBy" | "createdAt">>
): Task | undefined {
  if (typeof window !== "undefined" && !canAccess(getCurrentUser(), "tasks.edit")) {
    return undefined;
  }

  if (typeof window !== "undefined") loadTasks();
  const index = taskList.findIndex((task) => task.id === id);
  if (index === -1) return undefined;

  const previousTask = taskList[index];
  if (typeof window !== "undefined" && !canViewTask(previousTask, getCurrentUser())) {
    return undefined;
  }

  const updatedTask = { ...previousTask, ...data };
  taskList[index] = updatedTask;
  persistTasks();

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
  if (typeof window !== "undefined" && !canAccess(getCurrentUser(), "tasks.delete")) {
    return false;
  }

  if (typeof window !== "undefined") loadTasks();
  const task = taskList.find((item) => item.id === id);
  if (!task) return false;
  if (typeof window !== "undefined" && !canViewTask(task, getCurrentUser())) {
    return false;
  }

  addTaskActivity(id, "task_deleted", `Task deleted: ${task.title}`);
  taskList = taskList.filter((item) => item.id !== id);
  persistTasks();
  return true;
}

export function updateTaskStatus(
  id: number,
  status: TaskStatus
): Task | undefined {
  return updateTask(id, { status });
}
