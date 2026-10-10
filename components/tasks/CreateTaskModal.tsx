"use client";

import { FormEvent, useState } from "react";
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
  const [priority, setPriority] =
    useState<TaskPriority>("Medium");
  const [assignedTo, setAssignedTo] = useState("");
  const [deadline, setDeadline] = useState("");

  if (!isOpen) {
    return null;
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      !title.trim() ||
      !description.trim() ||
      !assignedTo.trim() ||
      !deadline
    ) {
      return;
    }

    onCreate({
      title: title.trim(),
      description: description.trim(),
      priority,
      assignedTo: assignedTo.trim(),
      deadline,
    });

    setTitle("");
    setDescription("");
    setPriority("Medium");
    setAssignedTo("");
    setDeadline("");

    onClose();
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/60
        p-4
        backdrop-blur-sm
      "
      onMouseDown={onClose}
    >
      <div
        className="
          w-full
          max-w-lg
          rounded-2xl
          border
          border-slate-800
          bg-slate-900
          p-5
          shadow-2xl
          sm:p-6
        "
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Create New Task
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Create a new task and assign it to a user.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              size-9
              items-center
              justify-center
              rounded-lg
              text-slate-400
              transition
              hover:bg-slate-800
              hover:text-white
            "
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >
          {/* Title */}
          <div>
            <label
              htmlFor="task-title"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Task Title
            </label>

            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="Enter task title"
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
                placeholder:text-slate-600
                focus:border-slate-600
              "
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="task-description"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Description
            </label>

            <textarea
              id="task-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="Describe the task..."
              rows={4}
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
                text-white
                outline-none
                placeholder:text-slate-600
                focus:border-slate-600
              "
            />
          </div>

          {/* Priority */}
          <div>
            <label
              htmlFor="task-priority"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Priority
            </label>

            <select
              id="task-priority"
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
                focus:border-slate-600
              "
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Assigned To */}
          <div>
            <label
              htmlFor="task-assigned"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Assigned To
            </label>

            <input
              id="task-assigned"
              type="text"
              value={assignedTo}
              onChange={(event) =>
                setAssignedTo(event.target.value)
              }
              placeholder="Enter user name"
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
                placeholder:text-slate-600
                focus:border-slate-600
              "
            />
          </div>

          {/* Deadline */}
          <div>
            <label
              htmlFor="task-deadline"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              Deadline
            </label>

            <input
              id="task-deadline"
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
                focus:border-slate-600
              "
            />
          </div>

          {/* Actions */}
          <div
            className="
              flex
              flex-col-reverse
              gap-3
              pt-2
              sm:flex-row
              sm:justify-end
            "
          >
            <button
              type="button"
              onClick={onClose}
              className="
                rounded-xl
                border
                border-slate-800
                px-4
                py-2.5
                text-sm
                font-medium
                text-slate-300
                transition
                hover:bg-slate-800
                hover:text-white
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              className="
                rounded-xl
                bg-white
                px-4
                py-2.5
                text-sm
                font-semibold
                text-slate-900
                transition
                hover:bg-slate-200
              "
            >
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
