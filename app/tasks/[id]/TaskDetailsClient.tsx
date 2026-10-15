"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Trash2,
  Pencil,
} from "lucide-react";

import {
  getTaskById,
  updateTask,
  deleteTask,
} from "@/data/taskStore";

import type {
  Task,
  TaskPriority,
  TaskStatus,
} from "@/data/tasks";
import TaskComments from "@/components/tasks/TaskComments";

type TaskDetailsClientProps = {
  id: number;
};

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

export default function TaskDetailsClient({
  id,
}: TaskDetailsClientProps) {
  const [task, setTask] = useState<Task | undefined>(() =>
    getTaskById(id)
  );

  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState(
    task?.title ?? ""
  );

  const [description, setDescription] = useState(
    task?.description ?? ""
  );

  const [priority, setPriority] =
    useState<TaskPriority>(
      task?.priority ?? "Medium"
    );

  const [status, setStatus] =
    useState<TaskStatus>(
      task?.status ?? "Pending"
    );

  const [assignedTo, setAssignedTo] = useState(
    task?.assignedTo ?? ""
  );

  const [deadline, setDeadline] = useState(
    task?.deadline ?? ""
  );

  if (!task) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-white">
            Task Not Found
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            The task you are looking for does not exist.
          </p>

          <Link
            href="/tasks"
            className="
              mt-6
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-white
              px-4
              py-2.5
              text-sm
              font-medium
              text-slate-900
              transition
              hover:bg-slate-200
            "
          >
            <ArrowLeft size={16} />
            Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

  function handleSave() {
    const updatedTask = updateTask(id, {
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      assignedTo: assignedTo.trim(),
      deadline,
    });

    if (!updatedTask) {
      return;
    }

    setTask(updatedTask);
    setIsEditing(false);
  }

  function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    const deleted = deleteTask(id);

    if (deleted) {
      window.location.href = "/tasks";
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/tasks"
          className="
            mb-4
            inline-flex
            items-center
            gap-2
            text-sm
            text-slate-400
            transition
            hover:text-white
          "
        >
          <ArrowLeft size={16} />
          Back to Tasks
        </Link>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {task.title}
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Task #{task.id}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() =>
                setIsEditing((current) => !current)
              }
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-slate-700
                bg-slate-900
                px-4
                py-2.5
                text-sm
                font-medium
                text-white
                transition
                hover:bg-slate-800
              "
            >
              <Pencil size={16} />

              {isEditing ? "Cancel" : "Edit"}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-red-500/20
                bg-red-500/10
                px-4
                py-2.5
                text-sm
                font-medium
                text-red-400
                transition
                hover:bg-red-500/20
              "
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div
        className="
          rounded-2xl
          border
          border-slate-800
          bg-slate-900
          p-5
          sm:p-6
        "
      >
        {isEditing ? (
          /* Edit Form */
          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-800
                  bg-slate-950
                  px-4
                  py-3
                  text-sm
                  text-white
                  outline-none
                  focus:border-slate-600
                "
              />
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                rows={5}
                className="
                  w-full
                  resize-none
                  rounded-xl
                  border
                  border-slate-800
                  bg-slate-950
                  px-4
                  py-3
                  text-sm
                  leading-6
                  text-white
                  outline-none
                  focus:border-slate-600
                "
              />
            </div>

            {/* Priority + Status */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(event) =>
                    setPriority(
                      event.target.value as TaskPriority
                    )
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-800
                    bg-slate-950
                    px-4
                    py-3
                    text-sm
                    text-white
                    outline-none
                  "
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value as TaskStatus
                    )
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-800
                    bg-slate-950
                    px-4
                    py-3
                    text-sm
                    text-white
                    outline-none
                  "
                >
                  <option value="Pending">
                    Pending
                  </option>

                  <option value="In Progress">
                    In Progress
                  </option>

                  <option value="Completed">
                    Completed
                  </option>
                </select>
              </div>
            </div>

            {/* Assigned + Deadline */}
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Assigned To
                </label>

                <input
                  type="text"
                  value={assignedTo}
                  onChange={(event) =>
                    setAssignedTo(event.target.value)
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-800
                    bg-slate-950
                    px-4
                    py-3
                    text-sm
                    text-white
                    outline-none
                  "
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Deadline
                </label>

                <input
                  type="date"
                  value={deadline}
                  onChange={(event) =>
                    setDeadline(event.target.value)
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-slate-800
                    bg-slate-950
                    px-4
                    py-3
                    text-sm
                    text-white
                    outline-none
                  "
                />
              </div>
            </div>

            {/* Save */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                className="
                  rounded-xl
                  bg-white
                  px-5
                  py-2.5
                  text-sm
                  font-semibold
                  text-slate-900
                  transition
                  hover:bg-slate-200
                "
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          /* View Mode */
          <>
            {/* Description */}
            <div>
              <h2 className="text-sm font-medium text-slate-300">
                Description
              </h2>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                {task.description}
              </p>
            </div>

            <div className="my-6 border-t border-slate-800" />

            {/* Information */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Status */}
              <div>
                <p className="text-xs text-slate-500">
                  Status
                </p>

                <span
                  className={`
                    mt-2
                    inline-flex
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-medium
                    ${getStatusStyle(task.status)}
                  `}
                >
                  {task.status}
                </span>
              </div>

              {/* Priority */}
              <div>
                <p className="text-xs text-slate-500">
                  Priority
                </p>

                <span
                  className={`
                    mt-2
                    inline-flex
                    rounded-full
                    px-3
                    py-1
                    text-xs
                    font-medium
                    ${getPriorityStyle(task.priority)}
                  `}
                >
                  {task.priority}
                </span>
              </div>

              {/* Assigned */}
              <div>
                <p className="text-xs text-slate-500">
                  Assigned To
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <div
                    className="
                      flex
                      size-8
                      items-center
                      justify-center
                      rounded-full
                      bg-slate-700
                      text-xs
                      font-semibold
                      text-white
                    "
                  >
                    {task.assignedTo
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <span className="text-sm text-slate-300">
                    {task.assignedTo}
                  </span>
                </div>
              </div>

              {/* Created */}
              <div>
                <p className="text-xs text-slate-500">
                  Created At
                </p>

                <div className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                  <Calendar size={16} />
                  {task.createdAt}
                </div>
              </div>

              {/* Deadline */}
              <div>
                <p className="text-xs text-slate-500">
                  Deadline
                </p>

                <div className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                  <Clock size={16} />
                  {task.deadline}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <TaskComments taskId={task.id} />
    </div>
  );
}
