"use client";

import { Clock } from "lucide-react";

type TaskDeadlineStatusProps = {
  deadline: string;
  status: "Pending" | "In Progress" | "Completed";
};

export default function TaskDeadlineStatus({
  deadline,
  status,
}: TaskDeadlineStatusProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadlineDate = deadline ? new Date(`${deadline}T00:00:00`) : null;
  const hasValidDeadline =
    deadlineDate !== null && !Number.isNaN(deadlineDate.getTime());

  const daysRemaining = hasValidDeadline
    ? Math.round((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  let label = "On Track";
  let style =
    "bg-green-500/10 text-green-400";

  if (!hasValidDeadline) {
    label = "No Deadline";
    style = "bg-slate-500/10 text-slate-400";
  } else if (status === "Completed") {
    label = "Completed";
    style =
      "bg-blue-500/10 text-blue-400";
  } else if (daysRemaining !== null && daysRemaining < 0) {
    label = "Overdue";
    style =
      "bg-red-500/10 text-red-400";
  } else if (daysRemaining !== null && daysRemaining <= 2) {
    label = "Due Soon";
    style =
      "bg-yellow-500/10 text-yellow-400";
  }

  return (
    <div className="flex items-center gap-2">
      <Clock
        size={16}
        className="text-slate-500"
      />

      <span
        className={`
          rounded-full
          px-3 py-1
          text-xs font-medium
          ${style}
        `}
      >
        {label}
      </span>

      {hasValidDeadline && status !== "Completed" &&
        daysRemaining !== null && daysRemaining >= 0 && (
          <span className="text-xs text-slate-500">
            {daysRemaining === 0
              ? "Due today"
              : `${daysRemaining} days left`}
          </span>
        )}
    </div>
  );
}