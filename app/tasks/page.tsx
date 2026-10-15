"use client";

import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";

import TaskCard from "@/components/tasks/TaskCard";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";

import {
  getTasks,
  loadTasks,
  createTask,
} from "@/data/taskStore";

import type { Task } from "@/data/tasks";

type Filter =
  | "All"
  | "Pending"
  | "In Progress"
  | "Completed"
  | "Overdue";

const filters: Filter[] = [
  "All",
  "Pending",
  "In Progress",
  "Completed",
  "Overdue",
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(getTasks());

  useEffect(() => {
    setTasks(loadTasks());
  }, []);

  const [activeFilter, setActiveFilter] =
    useState<Filter>("All");

  const [search, setSearch] = useState("");

  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState(false);

  const filteredTasks = tasks.filter((task) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadlineDate = task.deadline
      ? new Date(`${task.deadline}T00:00:00`)
      : null;

    const isOverdue =
      deadlineDate !== null &&
      !Number.isNaN(deadlineDate.getTime()) &&
      deadlineDate.getTime() < today.getTime() &&
      task.status !== "Completed";

    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Overdue"
        ? isOverdue
        : task.status === activeFilter);

    const searchValue =
      search.toLowerCase().trim();

    const matchesSearch =
      task.title
        .toLowerCase()
        .includes(searchValue) ||
      task.description
        .toLowerCase()
        .includes(searchValue) ||
      task.assignedTo
        .toLowerCase()
        .includes(searchValue);

    return matchesFilter && matchesSearch;
  });

  function handleCreateTask(data: {
    title: string;
    description: string;
    priority: "Low" | "Medium" | "High";
    assignedTo: string;
    deadline: string;
  }) {
    const newTask = createTask(data);

    setTasks(getTasks());

    console.log("Task created:", newTask);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <h1 className="text-2xl font-bold text-white">
            Tasks
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Manage and track your tasks.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setIsCreateModalOpen(true)
          }
          className="
            inline-flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-white
            px-4
            py-2.5
            text-sm
            font-semibold
            text-slate-900
            transition
            hover:bg-slate-200
            sm:w-auto
          "
        >
          <Plus size={18} />
          Add Task
        </button>
      </div>

      {/* Search + Filters */}
      <div
        className="
          flex
          flex-col
          gap-4
          lg:flex-row
          lg:items-center
          lg:justify-between
        "
      >
        {/* Search */}
        <div className="relative w-full lg:max-w-sm">
          <Search
            size={18}
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
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
              border
              border-slate-800
              bg-slate-900
              py-2.5
              pl-10
              pr-4
              text-sm
              text-white
              outline-none
              placeholder:text-slate-600
              focus:border-slate-600
            "
          />
        </div>

        {/* Filters */}
        <div
          className="
            flex
            w-full
            gap-2
            overflow-x-auto
            pb-1
            lg:w-auto
          "
        >
          {filters.map((filter) => {
            const isActive =
              activeFilter === filter;

            return (
              <button
                key={filter}
                type="button"
                onClick={() =>
                  setActiveFilter(filter)
                }
                className={`
                  whitespace-nowrap
                  rounded-xl
                  px-4
                  py-2
                  text-sm
                  font-medium
                  transition
                  ${
                    isActive
                      ? "bg-white text-slate-900"
                      : "border border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white"
                  }
                `}
              >
                {filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tasks */}
      {filteredTasks.length > 0 ? (
        <div className="grid gap-4">
          {filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              id={task.id}
              title={task.title}
              description={task.description}
              status={task.status}
              priority={task.priority}
              assignedTo={task.assignedTo}
              deadline={task.deadline}
            />
          ))}
        </div>
      ) : (
        <div
          className="
            rounded-2xl
            border
            border-dashed
            border-slate-800
            bg-slate-900/50
            px-6
            py-16
            text-center
          "
        >
          <h3 className="text-base font-semibold text-white">
            No tasks found
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Try changing your search or filter.
          </p>
        </div>
      )}

      {/* Create Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() =>
          setIsCreateModalOpen(false)
        }
        onCreate={handleCreateTask}
      />
    </div>
  );
}
