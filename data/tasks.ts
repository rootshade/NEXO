export type TaskStatus =
  | "Pending"
  | "In Progress"
  | "Completed";

export type TaskPriority =
  | "Low"
  | "Medium"
  | "High";

export type Task = {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  /** Name of the user who created this task. */
  createdBy?: string;

  // Task dates
  createdAt: string;
  deadline: string;
};

export const tasks: Task[] = [
  {
    id: 1,
    title: "Design login page",
    description:
      "Create and finalize the login page design for the NEXO platform.",
    status: "In Progress",
    priority: "High",
    assignedTo: "Mohammad",
    createdBy: "Mohammad",
    createdAt: "2026-10-01",
    deadline: "2026-10-10",
  },

  {
    id: 2,
    title: "Review letters",
    description:
      "Review received letters and prepare the required responses.",
    status: "Pending",
    priority: "Medium",
    assignedTo: "Mohammad",
    createdBy: "Mohammad",
    createdAt: "2026-10-03",
    deadline: "2026-10-08",
  },

  {
    id: 3,
    title: "Configure user permissions",
    description:
      "Configure roles and permissions for the NEXO users.",
    status: "Completed",
    priority: "High",
    assignedTo: "Ali",
    createdBy: "Mohammad",
    createdAt: "2026-09-28",
    deadline: "2026-10-02",
  },

  {
    id: 4,
    title: "Prepare dashboard",
    description:
      "Prepare the main dashboard and finalize its components.",
    status: "In Progress",
    priority: "Low",
    assignedTo: "Mohammad",
    createdBy: "Mohammad",
    createdAt: "2026-10-02",
    deadline: "2026-10-15",
  },
];