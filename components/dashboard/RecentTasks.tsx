import Link from "next/link";
import { ArrowRight } from "lucide-react";

type Task = {
  id: number;
  title: string;
  status: "Pending" | "In Progress" | "Completed";
  priority: "Low" | "Medium" | "High";
};

const tasks: Task[] = [
  {
    id: 1,
    title: "Design login page",
    status: "In Progress",
    priority: "High",
  },
  {
    id: 2,
    title: "Review letters",
    status: "Pending",
    priority: "Medium",
  },
  {
    id: 3,
    title: "Configure user permissions",
    status: "Completed",
    priority: "High",
  },
  {
    id: 4,
    title: "Prepare dashboard",
    status: "In Progress",
    priority: "Low",
  },
];

function getStatusStyle(status: Task["status"]) {
  switch (status) {
    case "Completed":
      return "bg-green-500/10 text-green-400";

    case "In Progress":
      return "bg-blue-500/10 text-blue-400";

    case "Pending":
      return "bg-yellow-500/10 text-yellow-400";
  }
}

function getPriorityStyle(priority: Task["priority"]) {
  switch (priority) {
    case "High":
      return "bg-red-500/10 text-red-400";

    case "Medium":
      return "bg-yellow-500/10 text-yellow-400";

    case "Low":
      return "bg-green-500/10 text-green-400";
  }
}

export default function RecentTasks() {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Recent Tasks
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Latest tasks in your workspace
          </p>
        </div>

        <Link
          href="/tasks"
          className="
            hidden items-center gap-1
            text-sm font-medium
            text-slate-400
            transition-colors
            hover:text-white
            sm:flex
          "
        >
          View all

          <ArrowRight size={16} />
        </Link>
      </div>

      {/* Tasks */}
      <div className="divide-y divide-slate-800">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="
              flex flex-col gap-3
              px-5 py-4
              transition-colors
              hover:bg-slate-800/50
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            {/* Task Info */}
            <div className="min-w-0">
              <p className="truncate font-medium text-white">
                {task.title}
              </p>

              <div className="mt-2">
                <span
                  className={`
                    inline-flex
                    rounded-full
                    px-2.5 py-1
                    text-xs font-medium
                    ${getStatusStyle(task.status)}
                  `}
                >
                  {task.status}
                </span>
              </div>
            </div>

            {/* Priority */}
            <span
              className={`
                w-fit
                rounded-full
                px-3 py-1
                text-xs font-medium
                ${getPriorityStyle(task.priority)}
              `}
            >
              {task.priority}
            </span>
          </div>
        ))}
      </div>

      {/* Mobile View All */}
      <div className="border-t border-slate-800 p-4 sm:hidden">
        <Link
          href="/tasks"
          className="
            flex items-center
            justify-center gap-2
            rounded-xl
            bg-slate-800
            px-4 py-3
            text-sm font-medium
            text-slate-200
            transition-colors
            hover:bg-slate-700
            hover:text-white
          "
        >
          View all tasks

          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}