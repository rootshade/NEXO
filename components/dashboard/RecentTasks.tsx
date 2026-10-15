"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { loadTasks } from "@/data/taskStore";
import type { Task } from "@/data/tasks";

function getStatusStyle(status: Task["status"]) {
  switch (status) {
    case "Completed":
      return "bg-green-500/10 text-green-400";
    case "In Progress":
      return "bg-sky-400/10 text-sky-300";
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
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const refreshTasks = () => setTasks(loadTasks().slice(0, 4));
    const timer = window.setTimeout(refreshTasks, 0);

    window.addEventListener("focus", refreshTasks);
    window.addEventListener("storage", refreshTasks);
    window.addEventListener("nexo-tasks-updated", refreshTasks);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", refreshTasks);
      window.removeEventListener("storage", refreshTasks);
      window.removeEventListener("nexo-tasks-updated", refreshTasks);
    };
  }, []);

  return (
    <section className="overflow-hidden rounded-2xl border border-indigo-400/15 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30">
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-white">Recent Tasks</h2>
          <p className="mt-1 text-sm text-slate-400">
            Latest tasks in your workspace
          </p>
        </div>

        <Link
          href="/tasks"
          className="hidden items-center gap-1 text-sm font-medium text-slate-400 transition-colors hover:text-white sm:flex"
        >
          View all
          <ArrowRight size={16} />
        </Link>
      </div>

      <div className="divide-y divide-slate-800">
        {tasks.map((task) => (
          <Link
            key={task.id}
            href={`/tasks/${task.id}`}
            className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-cyan-400/10/50 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-white">{task.title}</p>
              <div className="mt-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(task.status)}`}
                >
                  {task.status}
                </span>
              </div>
            </div>

            <span
              className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${getPriorityStyle(task.priority)}`}
            >
              {task.priority}
            </span>
          </Link>
        ))}

        {tasks.length === 0 && (
          <div className="px-5 py-8 text-center">
            <p className="text-sm font-medium text-white">No tasks yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Create a task to see it here.
            </p>
            <Link
              href="/tasks"
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white"
            >
              Go to tasks <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>

      <div className="border-t border-slate-800 p-4 sm:hidden">
        <Link
          href="/tasks"
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700 hover:text-white"
        >
          View all tasks
          <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
