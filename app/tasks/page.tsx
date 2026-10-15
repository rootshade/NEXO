"use client";

import { useEffect, useState } from "react";
import { Plus, Search, ListTodo, Clock3, CheckCircle2, AlertTriangle, ArrowUpDown } from "lucide-react";

import TaskCard from "@/components/tasks/TaskCard";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";

import {
  getTasks,
  loadTasks,
  createTask,
} from "@/data/taskStore";

import type { Task } from "@/data/tasks";

type SortOption = "newest" | "oldest" | "deadline" | "priority";
type PriorityFilter = "All" | "Low" | "Medium" | "High";

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
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("All");

  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState(false);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueTasksCount = tasks.filter((task) => {
    if (!task.deadline || task.status === "Completed") return false;
    const deadlineDate = new Date(`${task.deadline}T00:00:00`);
    return !Number.isNaN(deadlineDate.getTime()) && deadlineDate.getTime() < today.getTime();
  }).length;

  const taskStats = [
    { label: "Total Tasks", value: tasks.length, icon: ListTodo, iconStyle: "bg-slate-500/10 text-slate-300" },
    { label: "In Progress", value: tasks.filter((task) => task.status === "In Progress").length, icon: Clock3, iconStyle: "bg-blue-500/10 text-blue-400" },
    { label: "Completed", value: tasks.filter((task) => task.status === "Completed").length, icon: CheckCircle2, iconStyle: "bg-green-500/10 text-green-400" },
    { label: "Overdue", value: overdueTasksCount, icon: AlertTriangle, iconStyle: "bg-red-500/10 text-red-400" },
  ];

  const filteredTasks = tasks.filter((task) => {
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

    const matchesPriority =
      priorityFilter === "All" || task.priority === priorityFilter;

    const matchesSearch =
      task.title
        .toLowerCase()
        .includes(searchValue) ||
      task.description
        .toLowerCase()
        .includes(searchValue) ||
      task.assignedTo
        .toLowerCase()
        .includes(searchValue) ||
      (task.deadline ?? "").toLowerCase().includes(searchValue);

    return matchesFilter && matchesPriority && matchesSearch;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "deadline") {
      const aDeadline = a.deadline ? new Date(`${a.deadline}T00:00:00`).getTime() : Number.POSITIVE_INFINITY;
      const bDeadline = b.deadline ? new Date(`${b.deadline}T00:00:00`).getTime() : Number.POSITIVE_INFINITY;
      const safeA = Number.isNaN(aDeadline) ? Number.POSITIVE_INFINITY : aDeadline;
      const safeB = Number.isNaN(bDeadline) ? Number.POSITIVE_INFINITY : bDeadline;
      return safeA - safeB;
    }

    if (sortBy === "priority") {
      const priorityRank = { High: 3, Medium: 2, Low: 1 };
      return priorityRank[b.priority] - priorityRank[a.priority];
    }

    const aCreated = new Date(a.createdAt).getTime();
    const bCreated = new Date(b.createdAt).getTime();
    const safeA = Number.isNaN(aCreated) ? 0 : aCreated;
    const safeB = Number.isNaN(bCreated) ? 0 : bCreated;

    return sortBy === "newest" ? safeB - safeA : safeA - safeB;
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

      {/* Task Statistics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {taskStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`flex size-11 items-center justify-center rounded-xl ${stat.iconStyle}`}>
                  <Icon size={21} />
                </div>
              </div>
            </div>
          );
        })}
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

        {/* Sorting */}
        <div className="relative w-full lg:w-56">
          <ArrowUpDown
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
            aria-label="Sort tasks"
            className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-900 py-2.5 pl-9 pr-3 text-sm text-white outline-none focus:border-slate-600"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="deadline">Nearest deadline</option>
            <option value="priority">Highest priority</option>
          </select>
        </div>

        {/* Priority filter */}
        <div className="w-full lg:w-44">
          <select
            value={priorityFilter}
            onChange={(event) => setPriorityFilter(event.target.value as PriorityFilter)}
            aria-label="Filter by priority"
            className="w-full rounded-xl border border-slate-800 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-slate-600"
          >
            <option value="All">All priorities</option>
            <option value="High">High priority</option>
            <option value="Medium">Medium priority</option>
            <option value="Low">Low priority</option>
          </select>
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
      {sortedTasks.length > 0 ? (
        <div className="grid gap-4">
          {sortedTasks.map((task) => (
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
