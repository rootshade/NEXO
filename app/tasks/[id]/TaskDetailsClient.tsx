"use client";

import { useEffect, useState } from "react";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Trash2,
  Pencil,
} from "lucide-react";

import {
  loadTasks,
  updateTask,
  deleteTask,
} from "@/data/taskStore";

import type {
  Task,
  TaskPriority,
  TaskStatus,
} from "@/data/tasks";
import TaskComments from "@/components/tasks/TaskComments";
import TaskActivityLog from "@/components/tasks/TaskActivityLog";
import TaskAttachments from "@/components/tasks/TaskAttachments";
import { cleanupTaskData } from "@/data/taskCleanup";
import { canAccess, canViewTask, getCurrentUser } from "@/data/accessControl";
import { isValidDate } from "@/data/taskValidation";

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
  const [task, setTask] = useState<Task | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [canEditTask, setCanEditTask] = useState(false);
  const [canDeleteTask, setCanDeleteTask] = useState(false);
  const [isAccessDenied, setIsAccessDenied] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [editError, setEditError] = useState("");

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

  const router = useRouter();

  useEffect(() => {
    function refreshTaskPermissions() {
      const user = getCurrentUser();
      setCanEditTask(canAccess(user, "tasks.edit"));
      setCanDeleteTask(canAccess(user, "tasks.delete"));
      const currentTask = loadTasks().find((item) => item.id === id);
      setIsAccessDenied(!!currentTask && !canViewTask(currentTask, user));
    }

    refreshTaskPermissions();
    window.addEventListener("storage", refreshTaskPermissions);
    window.addEventListener("nexo-current-user-updated", refreshTaskPermissions);
    window.addEventListener("nexo-permissions-updated", refreshTaskPermissions);

    const timer = window.setTimeout(() => {
      const savedTask = loadTasks().find((item) => item.id === id);
      setIsAccessDenied(!!savedTask && !canViewTask(savedTask, getCurrentUser()));
      setTask(savedTask);
      setTitle(savedTask?.title ?? "");
      setDescription(savedTask?.description ?? "");
      setPriority(savedTask?.priority ?? "Medium");
      setStatus(savedTask?.status ?? "Pending");
      setAssignedTo(savedTask?.assignedTo ?? "");
      setDeadline(savedTask?.deadline ?? "");
      setIsLoading(false);
    }, 0);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", refreshTaskPermissions);
      window.removeEventListener("nexo-current-user-updated", refreshTaskPermissions);
      window.removeEventListener("nexo-permissions-updated", refreshTaskPermissions);
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-400">Loading task...</p>
      </div>
    );
  }

  if (isAccessDenied) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-white">Access Denied</h1>
          <p className="mt-2 text-sm text-slate-400">
            You do not have access to view this task.
          </p>
          <Link
            href="/tasks"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-900 transition hover:bg-slate-200"
          >
            <ArrowLeft size={16} />
            Back to Tasks
          </Link>
        </div>
      </div>
    );
  }

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

  function handleCancelEdit() {
    setTitle(task?.title ?? "");
    setDescription(task?.description ?? "");
    setPriority(task?.priority ?? "Medium");
    setStatus(task?.status ?? "Pending");
    setAssignedTo(task?.assignedTo ?? "");
    setDeadline(task?.deadline ?? "");
    setEditError("");
    setIsEditing(false);
  }

  function handleSave() {
    setEditError("");

    if (!canEditTask) {
      setEditError("You do not have permission to edit tasks.");
      setIsEditing(false);
      return;
    }

    if (
      !title.trim() ||
      !description.trim() ||
      !assignedTo.trim() ||
      !deadline
    ) {
      setEditError("Please complete all required fields.");
      return;
    }

    if (title.trim().length > 100) {
      setEditError("Task title cannot exceed 100 characters.");
      return;
    }

    if (description.trim().length > 2000) {
      setEditError("Description cannot exceed 2000 characters.");
      return;
    }

    if (assignedTo.trim().length > 100) {
      setEditError("Assignee name cannot exceed 100 characters.");
      return;
    }

    if (!isValidDate(deadline)) {
      setEditError("Please select a valid deadline.");
      return;
    }

    const updatedTask = updateTask(id, {
      title: title.trim(),
      description: description.trim(),
      priority,
      status,
      assignedTo: assignedTo.trim(),
      deadline,
    });

    if (!updatedTask) {
      setEditError("Unable to save changes. Please try again.");
      return;
    }

    setTask(updatedTask);
    setIsEditing(false);
  }

  function handleDelete() {
    if (!canDeleteTask) {
      setDeleteError("You do not have permission to delete tasks.");
      setShowDeleteModal(true);
      return;
    }
    setDeleteError("");
    setShowDeleteModal(true);
  }

  async function confirmDeleteTask() {
    if (!canDeleteTask) {
      setDeleteError("You do not have permission to delete tasks.");
      return;
    }
    const deleted = deleteTask(id);
    if (deleted) {
      await cleanupTaskData(id);
      router.push("/tasks");
      return;
    }
    setDeleteError("The task could not be deleted. Please try again.");
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
          {(canEditTask || canDeleteTask) && (
            <div className="flex gap-2">
              {canEditTask && (
                <button
                  type="button"
                  onClick={() => {
                    if (isEditing) {
                      handleCancelEdit();
                    } else {
                      setEditError("");
                      setIsEditing(true);
                    }
                  }}
                  className="
                    inline-flex items-center gap-2 rounded-xl border
                    border-slate-700 bg-slate-900 px-4 py-2.5 text-sm
                    font-medium text-white transition hover:bg-slate-800
                  "
                >
                  <Pencil size={16} />
                  {isEditing ? "Cancel" : "Edit"}
                </button>
              )}

              {canDeleteTask && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="
                    inline-flex items-center gap-2 rounded-xl border
                    border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm
                    font-medium text-red-400 transition hover:bg-red-500/20
                  "
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              )}
            </div>
          )}
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
                onChange={(event) => {
                  setTitle(event.target.value);
                  setEditError("");
                }}
                maxLength={100}
                required
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
                onChange={(event) => {
                  setDescription(event.target.value);
                  setEditError("");
                }}
                rows={5}
                maxLength={2000}
                required
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
                  onChange={(event) => {
                    setAssignedTo(event.target.value);
                    setEditError("");
                  }}
                  maxLength={100}
                  required
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
                  onChange={(event) => {
                    setDeadline(event.target.value);
                    setEditError("");
                  }}
                  required
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

            {editError && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
              >
                {editError}
              </div>
            )}

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

              {/* Creator */}
              <div>
                <p className="text-xs text-slate-500">
                  Created By
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-full bg-indigo-500/15 text-xs font-semibold text-indigo-300">
                    {(task.createdBy || "Unknown").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-300">
                    {task.createdBy || "Unknown"}
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

      <TaskAttachments taskId={task.id} />
      <TaskActivityLog taskId={task.id} />
      <TaskComments taskId={task.id} />
      <ConfirmDeleteModal open={showDeleteModal} title="Delete task?" description="This will permanently delete this task and its comments and attachments." error={deleteError} onCancel={() => { setShowDeleteModal(false); setDeleteError(""); }} onConfirm={() => void confirmDeleteTask()} />
    </div>
  );
}
