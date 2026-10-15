"use client";

import { useCallback, useEffect, useState } from "react";
import { Activity, CheckCircle2, Clock3, PlusCircle, Trash2 } from "lucide-react";
import {
  getTaskActivities,
  TASK_ACTIVITY_EVENT,
  type TaskActivity,
} from "@/data/taskActivity";

type TaskActivityLogProps = {
  taskId: number;
};

function getActivityIcon(type: TaskActivity["type"]) {
  switch (type) {
    case "task_created":
      return <PlusCircle size={16} className="text-emerald-400" />;
    case "status_changed":
      return <CheckCircle2 size={16} className="text-blue-400" />;
    case "task_deleted":
      return <Trash2 size={16} className="text-red-400" />;
    case "task_updated":
    default:
      return <Activity size={16} className="text-slate-400" />;
  }
}

export default function TaskActivityLog({ taskId }: TaskActivityLogProps) {
  const [activities, setActivities] = useState<TaskActivity[]>([]);

  const refreshActivities = useCallback(() => {
    setActivities(getTaskActivities(taskId));
  }, [taskId]);

  useEffect(() => {
    const timer = window.setTimeout(refreshActivities, 0);
    window.addEventListener(TASK_ACTIVITY_EVENT, refreshActivities);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(TASK_ACTIVITY_EVENT, refreshActivities);
    };
  }, [refreshActivities]);

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <Clock3 size={18} className="text-slate-400" />
        <h2 className="text-lg font-semibold text-white">Activity History</h2>
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
          {activities.length}
        </span>
      </div>

      {activities.length === 0 ? (
        <p className="text-sm text-slate-500">
          No activity recorded yet. New task changes will appear here.
        </p>
      ) : (
        <ol className="space-y-4">
          {activities.map((activity) => (
            <li key={activity.id} className="flex gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-800">
                {getActivityIcon(activity.type)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-200">{activity.message}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {activity.actor} ·{" "}
                  {new Date(activity.createdAt).toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
