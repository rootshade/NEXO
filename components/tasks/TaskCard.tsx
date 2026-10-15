import Link from "next/link";
import { CalendarDays } from "lucide-react";

type TaskStatus =
  | "Pending"
  | "In Progress"
  | "Completed";

type TaskPriority =
  | "Low"
  | "Medium"
  | "High";

type TaskCardProps = {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string;
  deadline: string;
};

function getStatusStyle(status: TaskStatus) {
  switch (status) {
    case "Completed":
      return "bg-green-500/10 text-green-400";

    case "In Progress":
      return "bg-sky-400/10 text-sky-300";

    case "Pending":
      return "bg-yellow-500/10 text-yellow-400";

    default:
      return "bg-slate-500/10 text-slate-400";
  }
}

function getPriorityStyle(priority: TaskPriority) {
  switch (priority) {
    case "High":
      return "bg-red-500/10 text-red-400";

    case "Medium":
      return "bg-yellow-500/10 text-yellow-400";

    case "Low":
      return "bg-green-500/10 text-green-400";

    default:
      return "bg-slate-500/10 text-slate-400";
  }
}

export default function TaskCard({
  id,
  title,
  description,
  status,
  priority,
  assignedTo,
  deadline,
}: TaskCardProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineDate = deadline ? new Date(`${deadline}T00:00:00`) : null;
  const hasValidDeadline = deadlineDate !== null && !Number.isNaN(deadlineDate.getTime());
  const isOverdue =
    hasValidDeadline && status !== "Completed" && deadlineDate.getTime() < today.getTime();

  const formattedDeadline = hasValidDeadline
    ? deadlineDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "No deadline";

  return (
    <Link
      href={`/tasks/${id}`}
      className="
        block
        rounded-2xl
        border border-slate-800
        bg-slate-900
        p-5
        transition-all
        duration-200
        hover:border-cyan-400/30
        hover:bg-cyan-400/10/70
      "
    >
      {/* Top */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="font-semibold text-white">
            {title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {description}
          </p>
        </div>

        <span
          className={`
            w-fit shrink-0
            rounded-full
            px-3 py-1
            text-xs font-medium
            ${getPriorityStyle(priority)}
          `}
        >
          {priority}
        </span>
      </div>

      {/* Bottom */}
      <div
        className="
          mt-5
          flex flex-col gap-3
          border-t border-slate-800
          pt-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <span
          className={`
            w-fit
            rounded-full
            px-3 py-1
            text-xs font-medium
            ${getStatusStyle(status)}
          `}
        >
          {status}
        </span>

        <div className="flex flex-wrap items-center gap-4">
          <div className={`flex items-center gap-2 text-sm ${isOverdue ? "text-red-400" : "text-slate-400"}`}>
            <CalendarDays size={16} />
            <span>{formattedDeadline}</span>
            {isOverdue && (
              <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                Overdue
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
          <div
            className="
              flex size-8
              items-center justify-center
              rounded-full
              bg-slate-700
              text-xs font-semibold
              text-white
            "
          >
            {assignedTo.charAt(0).toUpperCase()}
          </div>

          <span className="text-sm text-slate-400">
            {assignedTo}
          </span>
          </div>
        </div>
      </div>
    </Link>
  );
}