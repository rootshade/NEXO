"use client";

import { useState } from "react";
import { Plus, Search, X } from "lucide-react";

import TaskCard from "@/components/tasks/TaskCard";
import { tasks as initialTasks } from "@/data/tasks";

type Filter =
  | "All"
  | "Pending"
  | "In Progress"
  | "Completed";

const filters: Filter[] = [
  "All",
  "Pending",
  "In Progress",
  "Completed",
];

export default function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks);

  const [activeFilter, setActiveFilter] =
    useState<Filter>("All");

  const [search, setSearch] = useState("");

  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [priority, setPriority] =
    useState<"Low" | "Medium" | "High">("Medium");

  const [assignedTo, setAssignedTo] =
    useState("Mohammad");

  const filteredTasks = tasks.filter((task) => {
    const matchesFilter =
      activeFilter === "All" ||
      task.status === activeFilter;

    const matchesSearch =
      task.title
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      task.description
        .toLowerCase()
        .includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  function handleCreateTask() {
    if (!title.trim() || !description.trim()) {
      return;
    }

    const newTask = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      status: "Pending" as const,
      priority,
      assignedTo:
        assignedTo.trim() || "Mohammad",
    };

    setTasks((currentTasks) => [
      ...currentTasks,
      newTask,
    ]);

    setTitle("");
    setDescription("");
    setPriority("Medium");
    setAssignedTo("Mohammad");
    setShowCreateForm(false);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Tasks
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Manage and track your assigned tasks.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowCreateForm(true)
          }
          className="
            flex items-center justify-center gap-2
            rounded-xl
            bg-white
            px-4 py-2.5
            text-sm font-semibold
            text-slate-950
            transition-colors
            hover:bg-slate-200
          "
        >
          <Plus size={18} />
          Create Task
        </button>
      </div>

      {/* Create Task Modal */}
      {showCreateForm && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/70
            p-4
            backdrop-blur-sm
          "
          onClick={() =>
            setShowCreateForm(false)
          }
        >
          <div
            className="
              w-full max-w-2xl
              max-h-[90vh]
              overflow-y-auto
              rounded-2xl
              border border-slate-800
              bg-slate-900
              shadow-2xl
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* Modal Header */}
            <div
              className="
                flex items-center justify-between
                border-b border-slate-800
                px-6 py-5
              "
            >
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Create New Task
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add a new task to the NEXO workspace.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreateForm(false)
                }
                className="
                  flex h-9 w-9
                  items-center justify-center
                  rounded-lg
                  text-slate-500
                  transition-colors
                  hover:bg-slate-800
                  hover:text-white
                "
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5 px-6 py-6">
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
                  placeholder="Enter task title..."
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
                  placeholder="Describe the task..."
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
                    placeholder:text-slate-600
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
                        event.target.value as
                          | "Low"
                          | "Medium"
                          | "High"
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
                    placeholder="Enter user name..."
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
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="
                flex flex-col-reverse gap-3
                border-t border-slate-800
                px-6 py-5
                sm:flex-row sm:justify-end
              "
            >
              <button
                type="button"
                onClick={() =>
                  setShowCreateForm(false)
                }
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
                onClick={handleCreateTask}
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
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search
          size={18}
          className="
            absolute left-4 top-1/2
            -translate-y-1/2
            text-slate-500
          "
        />

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search tasks..."
          className="
            w-full
            rounded-xl
            border border-slate-800
            bg-slate-900
            py-3 pl-11 pr-4
            text-sm text-white
            outline-none
            placeholder:text-slate-500
            transition-colors
            focus:border-slate-600
          "
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => {
          const active =
            activeFilter === filter;

          return (
            <button
              key={filter}
              type="button"
              onClick={() =>
                setActiveFilter(filter)
              }
              className={`
                shrink-0
                rounded-lg
                px-4 py-2
                text-sm font-medium
                transition-colors
                ${
                  active
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }
              `}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Task List */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            id={task.id}
            title={task.title}
            description={task.description}
            status={task.status}
            priority={task.priority}
            assignedTo={task.assignedTo}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div
          className="
            rounded-2xl
            border border-dashed
            border-slate-800
            bg-slate-900/50
            px-6 py-12
            text-center
          "
        >
          <p className="font-medium text-white">
            No tasks found
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Try changing your search or filter.
          </p>
        </div>
      )}
    </div>
  );
}