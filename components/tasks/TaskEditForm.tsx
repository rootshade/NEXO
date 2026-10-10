"use client";

import { useState } from "react";

type TaskPriority =
  | "Low"
  | "Medium"
  | "High";

type TaskEditFormProps = {
  initialTitle: string;
  initialDescription: string;
  initialPriority: TaskPriority;
  initialAssignedTo: string;
};

export default function TaskEditForm({
  initialTitle,
  initialDescription,
  initialPriority,
  initialAssignedTo,
}: TaskEditFormProps) {
  const [isEditing, setIsEditing] =
    useState(false);

  const [title, setTitle] =
    useState(initialTitle);

  const [description, setDescription] =
    useState(initialDescription);

  const [priority, setPriority] =
    useState<TaskPriority>(initialPriority);

  const [assignedTo, setAssignedTo] =
    useState(initialAssignedTo);

  const [saved, setSaved] =
    useState(false);

  function handleSave() {
    if (!title.trim() || !description.trim()) {
      return;
    }

    setTitle(title.trim());
    setDescription(description.trim());
    setAssignedTo(assignedTo.trim());

    setSaved(true);
    setIsEditing(false);

    setTimeout(() => {
      setSaved(false);
    }, 2000);
  }

  function handleCancel() {
    setTitle(initialTitle);
    setDescription(initialDescription);
    setPriority(initialPriority);
    setAssignedTo(initialAssignedTo);

    setIsEditing(false);
  }

  return (
    <div className="mt-8 border-t border-slate-800 pt-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">
            Task Information
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Edit the task information below.
          </p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="
              w-fit
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
            Edit Task
          </button>
        )}
      </div>

      {/* Form */}
      {isEditing && (
        <div className="mt-6 space-y-5">
          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Task Title
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
                border border-slate-800
                bg-slate-950
                px-4 py-3
                text-sm text-white
                outline-none
                placeholder:text-slate-600
                transition-colors
                focus:border-slate-600
                focus:ring-1
                focus:ring-slate-600
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
                setDescription(
                  event.target.value
                )
              }
              rows={5}
              className="
                w-full
                resize-none
                rounded-xl
                border border-slate-800
                bg-slate-950
                px-4 py-3
                text-sm text-white
                outline-none
                transition-colors
                focus:border-slate-600
                focus:ring-1
                focus:ring-slate-600
              "
            />
          </div>

          {/* Priority + Assigned To */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Priority */}
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
                  border border-slate-800
                  bg-slate-950
                  px-4 py-3
                  text-sm text-white
                  outline-none
                  transition-colors
                  focus:border-slate-600
                  focus:ring-1
                  focus:ring-slate-600
                "
              >
                <option value="Low">
                  Low
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="High">
                  High
                </option>
              </select>
            </div>

            {/* Assigned To */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Assigned To
              </label>

              <input
                type="text"
                value={assignedTo}
                onChange={(event) =>
                  setAssignedTo(
                    event.target.value
                  )
                }
                className="
                  w-full
                  rounded-xl
                  border border-slate-800
                  bg-slate-950
                  px-4 py-3
                  text-sm text-white
                  outline-none
                  transition-colors
                  focus:border-slate-600
                  focus:ring-1
                  focus:ring-slate-600
                "
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={handleCancel}
              className="
                rounded-xl
                border border-slate-800
                px-5 py-2.5
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
                px-5 py-2.5
                text-sm font-semibold
                text-slate-950
                transition-colors
                hover:bg-slate-200
              "
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Saved Message */}
      {saved && (
        <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          Task updated successfully.
        </div>
      )}
    </div>
  );
}