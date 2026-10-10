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

  const deadlineDate = new Date(deadline);

  const difference =
    deadlineDate.getTime() - today.getTime();

  const daysRemaining = Math.ceil(
    difference / (1000 * 60 * 60 * 24)
  );

  let label = "On Track";
  let style =
    "bg-green-500/10 text-green-400";

  if (status === "Completed") {
    label = "Completed";
    style =
      "bg-blue-500/10 text-blue-400";
  } else if (daysRemaining < 0) {
    label = "Overdue";
    style =
      "bg-red-500/10 text-red-400";
  } else if (daysRemaining <= 2) {
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

      {status !== "Completed" &&
        daysRemaining >= 0 && (
          <span className="text-xs text-slate-500">
            {daysRemaining === 0
              ? "Due today"
              : `${daysRemaining} days left`}
          </span>
        )}
    </div>
  );
}