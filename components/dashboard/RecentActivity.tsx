"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  ListTodo,
  Pencil,
  Trash2,
} from "lucide-react";

import {
  getRecentTaskActivities,
  TASK_ACTIVITY_EVENT,
  type TaskActivity,
} from "@/data/taskActivity";

function formatRelativeTime(value: string): string {
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return "Recently";

  const elapsedSeconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (elapsedSeconds < 60) return "Just now";

  const minutes = Math.floor(elapsedSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(value).toLocaleDateString();
}

function getActivityPresentation(activity: TaskActivity) {
  switch (activity.type) {
    case "task_created":
      return { title: "Task created", Icon: ListTodo };
    case "status_changed":
      return { title: "Task status changed", Icon: CheckCircle2 };
    case "task_updated":
      return { title: "Task updated", Icon: Pencil };
    case "task_deleted":
      return { title: "Task deleted", Icon: Trash2 };
  }
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<TaskActivity[]>([]);

  useEffect(() => {
    const refreshActivities = () => {
      setActivities(getRecentTaskActivities(6));
    };

    const timer = window.setTimeout(refreshActivities, 0);
    window.addEventListener(TASK_ACTIVITY_EVENT, refreshActivities);
    window.addEventListener("focus", refreshActivities);
    window.addEventListener("storage", refreshActivities);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(TASK_ACTIVITY_EVENT, refreshActivities);
      window.removeEventListener("focus", refreshActivities);
      window.removeEventListener("storage", refreshActivities);
    };
  }, []);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 px-5 py-4">
        <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
        <p className="mt-1 text-sm text-slate-400">
          Latest changes in your workspace
        </p>
      </div>

      {activities.length > 0 ? (
        <div className="divide-y divide-slate-800">
          {activities.map((activity) => {
            const { title, Icon } = getActivityPresentation(activity);

            return (
              <div
                key={activity.id}
                className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-slate-800/50"
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-slate-300">
                  <Icon size={18} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white">{title}</p>
                  <p className="mt-1 break-words text-sm text-slate-400">
                    {activity.message}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{activity.actor}</span>
                    <span aria-hidden="true">·</span>
                    <Clock3 size={12} />
                    <span>{formatRelativeTime(activity.createdAt)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-5 py-10 text-center">
          <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-slate-800 text-slate-400">
            <Clock3 size={20} />
          </div>
          <p className="mt-3 text-sm font-medium text-white">No activity yet</p>
          <p className="mt-1 text-sm text-slate-500">
            Create, update, or complete a task to see activity here.
          </p>
        </div>
      )}
    </section>
  );
}
