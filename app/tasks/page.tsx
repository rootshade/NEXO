"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";

import TaskCard from "@/components/tasks/TaskCard";
import { tasks } from "@/data/tasks";

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
  const [activeFilter, setActiveFilter] =
    useState<Filter>("All");

  const [search, setSearch] = useState("");

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
          const active = activeFilter === filter;

          return (
            <button
              key={filter}
              type="button"
              onClick={() => setActiveFilter(filter)}
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