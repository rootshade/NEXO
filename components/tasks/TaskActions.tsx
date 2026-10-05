"use client";

import { CheckCircle2 } from "lucide-react";

type TaskStatus =
  | "Pending"
  | "In Progress"
  | "Completed";

type TaskActionsProps = {
  status: TaskStatus;
  onStatusChange: (status: TaskStatus) => void;
};

export default function TaskActions({
  status,
  onStatusChange,
}: TaskActionsProps) {
  const handleComplete = () => {
    onStatusChange("Completed");
  };

  if (status === "Completed") {
    return (
      <div className="flex items-center justify-center gap-2 rounded-xl bg-green-500/10 px-4 py-3 text-sm font-medium text-green-400">
        <CheckCircle2 size={18} />
        Task Completed
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleComplete}
      className="
        flex w-full
        items-center justify-center gap-2
        rounded-xl
        bg-white
        px-4 py-3
        text-sm font-semibold
        text-slate-950
        transition-colors
        hover:bg-slate-200
      "
    >
      <CheckCircle2 size={18} />
      Mark as Completed
    </button>
  );
}