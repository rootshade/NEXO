"use client";

import { useState } from "react";

type TaskStatus =
  | "Pending"
  | "In Progress"
  | "Completed";

type TaskStatusControlProps = {
  taskId: number;
  initialStatus: TaskStatus;
};

const statuses: TaskStatus[] = [
  "Pending",
  "In Progress",
  "Completed",
];

function getStatusStyle(status: TaskStatus) {
  switch (status) {
    case "Completed":
      return "bg-green-500/10 text-green-400";

    case "In Progress":
      return "bg-blue-500/10 text-blue-400";

    case "Pending":
      return "bg-yellow-500/10 text-yellow-400";

    default:
      return "bg-slate-500/10 text-slate-400";
  }
}

export default function TaskStatusControl({
  taskId,
  initialStatus,
}: TaskStatusControlProps) {
  const [status, setStatus] =
    useState<TaskStatus>(initialStatus);

  const [isEditing, setIsEditing] =
    useState(false);

  const [selectedStatus, setSelectedStatus] =
    useState<TaskStatus>(initialStatus);

function handleSave() {
  const savedTasks = JSON.parse(
    localStorage.getItem("nexo_tasks") || "[]"
  );

  const updatedTask = {
    id: taskId,
    status: selectedStatus,
  };

  const existingTaskIndex =
    savedTasks.findIndex(
      (task: { id: number }) =>
        task.id === taskId
    );

  let updatedTasks;

  if (existingTaskIndex === -1) {
    updatedTasks = [
      ...savedTasks,
      updatedTask,
    ];
  } else {
    updatedTasks = savedTasks.map(
      (
        task: {
          id: number;
          status: TaskStatus;
          [key: string]: unknown;
        }
      ) =>
        task.id === taskId
          ? {
              ...task,
              status: selectedStatus,
            }
          : task
    );
  }

  localStorage.setItem(
    "nexo_tasks",
    JSON.stringify(updatedTasks)
  );

  setStatus(selectedStatus);
  setIsEditing(false);
}

function handleCancel() {
  setSelectedStatus(status);
  setIsEditing(false);
}

  return (
    <div className="mt-8 border-t border-slate-800 pt-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-slate-500">
            Current Status
          </p>

          {!isEditing ? (
            <span
              className={`
                mt-2
                inline-flex
                rounded-full
                px-3 py-1
                text-xs font-medium
                ${getStatusStyle(status)}
              `}
            >
              {status}
            </span>
          ) : (
            <select
              value={selectedStatus}
              onChange={(event) =>
                setSelectedStatus(
                  event.target.value as TaskStatus
                )
              }
              className="
                mt-2
                rounded-xl
                border border-slate-800
                bg-slate-950
                px-4 py-2.5
                text-sm text-white
                outline-none
                transition-colors
                focus:border-slate-600
                focus:ring-1
                focus:ring-slate-600
              "
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          )}
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="
              rounded-xl
              border border-slate-800
              px-4 py-2.5
              text-sm font-medium
              text-slate-300
              transition-colors
              hover:bg-slate-800
              hover:text-white
            "
          >
            Change Status
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="
                rounded-xl
                border border-slate-800
                px-4 py-2.5
                text-sm font-medium
                text-slate-400
                transition-colors
                hover:bg-slate-800
                hover:text-white
              "
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="
                rounded-xl
                bg-white
                px-4 py-2.5
                text-sm font-semibold
                text-slate-950
                transition-colors
                hover:bg-slate-200
              "
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}