"use client";

import { useState, type FormEvent } from "react";
import { X } from "lucide-react";

import type { TaskPriority } from "@/data/tasks";

type CreateTaskModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (task: {
    title: string;
    description: string;
    priority: TaskPriority;
    assignedTo: string;
    deadline: string;
  }) => void;
};

export default function CreateTaskModal({
  isOpen,
  onClose,
  onCreate,
}: CreateTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");

  function resetForm() {
    setTitle("");
    setDescription("");
    setPriority("Medium");
    setAssignedTo("");
    setDeadline("");
    setError("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!title.trim() || !description.trim() || !assignedTo.trim() || !deadline) {
      setError("Please complete all required fields.");
      return;
    }

    if (title.trim().length > 100) {
      setError("Task title cannot exceed 100 characters.");
      return;
    }

    if (description.trim().length > 2000) {
      setError("Description cannot exceed 2000 characters.");
      return;
    }

    if (assignedTo.trim().length > 100) {
      setError("Assignee name cannot exceed 100 characters.");
      return;
    }

    const selectedDate = new Date(`${deadline}T00:00:00`);

    if (Number.isNaN(selectedDate.getTime())) {
      setError("Please select a valid deadline.");
      return;
    }

    onCreate({
      title: title.trim(),
      description: description.trim(),
      priority,
      assignedTo: assignedTo.trim(),
      deadline,
    });

    resetForm();
    onClose();
  }

  if (!isOpen) {
    return null;
  }

  const inputClass =
    "w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-slate-500";

  const labelClass = "mb-2 block text-sm font-medium text-slate-300";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-task-title"
        className="my-auto w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl sm:p-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 id="create-task-title" className="text-lg font-semibold text-white">
              Create New Task
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Create a task and assign it to a user.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="flex size-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label htmlFor="task-title" className={labelClass}>
              Task Title
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
                setError("");
              }}
              placeholder="Enter task title"
              maxLength={100}
              required
              className={inputClass}
            />
            <p className="mt-1 text-right text-xs text-slate-500">
              {title.length}/100
            </p>
          </div>

          <div>
            <label htmlFor="task-description" className={labelClass}>
              Description
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(event) => {
                setDescription(event.target.value);
                setError("");
              }}
              placeholder="Describe the task..."
              rows={4}
              maxLength={2000}
              required
              className={`${inputClass} resize-y`}
            />
            <p className="mt-1 text-right text-xs text-slate-500">
              {description.length}/2000
            </p>
          </div>

          <div>
            <label htmlFor="task-priority" className={labelClass}>
              Priority
            </label>
            <select
              id="task-priority"
              value={priority}
              onChange={(event) => setPriority(event.target.value as TaskPriority)}
              className={inputClass}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label htmlFor="task-assigned" className={labelClass}>
              Assigned To
            </label>
            <input
              id="task-assigned"
              type="text"
              value={assignedTo}
              onChange={(event) => {
                setAssignedTo(event.target.value);
                setError("");
              }}
              placeholder="Enter user name"
              maxLength={100}
              required
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="task-deadline" className={labelClass}>
              Deadline
            </label>
            <input
              id="task-deadline"
              type="date"
              value={deadline}
              onChange={(event) => {
                setDeadline(event.target.value);
                setError("");
              }}
              required
              className={inputClass}
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
