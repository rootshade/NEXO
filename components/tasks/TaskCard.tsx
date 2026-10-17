import Link from "next/link";
import { CalendarDays, CircleCheck, Clock3, UserRound } from "lucide-react";

type TaskStatus = "Pending" | "In Progress" | "Completed";
type TaskPriority = "Low" | "Medium" | "High";

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
    case "Completed": return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
    case "In Progress": return "border-sky-400/30 bg-sky-400/10 text-sky-300";
    default: return "border-amber-400/30 bg-amber-400/10 text-amber-300";
  }
}

function getPriorityStyle(priority: TaskPriority) {
  switch (priority) {
    case "High": return "border-rose-400/30 bg-rose-400/10 text-rose-300";
    case "Medium": return "border-amber-400/30 bg-amber-400/10 text-amber-300";
    default: return "border-emerald-400/30 bg-emerald-400/10 text-emerald-300";
  }
}

export default function TaskCard({ id, title, description, status, priority, assignedTo, deadline }: TaskCardProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = deadline ? new Date(`${deadline}T00:00:00`) : null;
  const hasValidDeadline = deadlineDate !== null && !Number.isNaN(deadlineDate.getTime());
  const isOverdue = hasValidDeadline && status !== "Completed" && deadlineDate.getTime() < today.getTime();
  const formattedDeadline = hasValidDeadline ? deadlineDate.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "No deadline";

  return (
    <Link href={`/tasks/${id}`} className="group block rounded-2xl border border-indigo-400/15 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20 p-5 shadow-xl shadow-black/10 transition duration-200 hover:-translate-y-0.5 hover:border-cyan-400/30 hover:from-slate-900 hover:to-cyan-950/20">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-xs text-slate-500"><span className="size-1.5 rounded-full bg-cyan-300" /> Task</div>
          <h3 className="text-base font-semibold text-white transition group-hover:text-cyan-200">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
        </div>
        <span className={`w-fit shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${getPriorityStyle(priority)}`}>{priority}</span>
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-slate-800/80 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getStatusStyle(status)}`}>
            {status === "Completed" ? <CircleCheck size={13} /> : status === "In Progress" ? <Clock3 size={13} /> : <Clock3 size={13} />}
            {status}
          </span>
          {isOverdue && <span className="rounded-full border border-rose-400/30 bg-rose-400/10 px-2.5 py-1 text-xs font-medium text-rose-300">Overdue</span>}
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className={`flex items-center gap-2 text-sm ${isOverdue ? "text-rose-300" : "text-slate-400"}`}>
            <CalendarDays size={16} />
            <span>{formattedDeadline}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-500 text-xs font-bold text-white shadow-lg shadow-cyan-950/20"><UserRound size={15} /></div>
            <span className="text-sm text-slate-300">{assignedTo}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
