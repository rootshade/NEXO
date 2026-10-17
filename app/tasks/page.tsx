"use client";

import { useEffect, useState } from "react";
import { Plus, Search, ListTodo, Clock3, CheckCircle2, AlertTriangle, ArrowUpDown } from "lucide-react";

import TaskCard from "@/components/tasks/TaskCard";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";

import { getTasks, loadTasks, createTask } from "@/data/taskStore";
import type { Task } from "@/data/tasks";
import { canAccess, getCurrentUser } from "@/data/accessControl";

type SortOption = "newest" | "oldest" | "deadline" | "priority";
type PriorityFilter = "All" | "Low" | "Medium" | "High";
type Filter = "All" | "Pending" | "In Progress" | "Completed" | "Overdue";

const filters: Filter[] = ["All", "Pending", "In Progress", "Completed", "Overdue"];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("All");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [canCreateTasks, setCanCreateTasks] = useState(false);

  useEffect(() => {
    const refreshAccess = () => setCanCreateTasks(canAccess(getCurrentUser(), "tasks.create"));
    const timer = window.setTimeout(refreshAccess, 0);
    window.addEventListener("nexo-current-user-updated", refreshAccess);
    window.addEventListener("nexo-permissions-updated", refreshAccess);
    window.addEventListener("storage", refreshAccess);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("nexo-current-user-updated", refreshAccess);
      window.removeEventListener("nexo-permissions-updated", refreshAccess);
      window.removeEventListener("storage", refreshAccess);
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setTasks(loadTasks()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueTasksCount = tasks.filter((task) => {
    if (!task.deadline || task.status === "Completed") return false;
    const deadlineDate = new Date(`${task.deadline}T00:00:00`);
    return !Number.isNaN(deadlineDate.getTime()) && deadlineDate.getTime() < today.getTime();
  }).length;

  const taskStats = [
    { label: "Total Tasks", value: tasks.length, icon: ListTodo, color: "text-indigo-300", tile: "bg-indigo-400/10", border: "border-indigo-400/20", note: "Across this workspace" },
    { label: "In Progress", value: tasks.filter((task) => task.status === "In Progress").length, icon: Clock3, color: "text-sky-300", tile: "bg-sky-400/10", border: "border-sky-400/20", note: "Currently being worked on" },
    { label: "Completed", value: tasks.filter((task) => task.status === "Completed").length, icon: CheckCircle2, color: "text-emerald-300", tile: "bg-emerald-400/10", border: "border-emerald-400/20", note: "Successfully finished" },
    { label: "Overdue", value: overdueTasksCount, icon: AlertTriangle, color: "text-rose-300", tile: "bg-rose-400/10", border: "border-rose-400/20", note: "Need attention" },
  ];

  const filteredTasks = tasks.filter((task) => {
    const deadlineDate = task.deadline ? new Date(`${task.deadline}T00:00:00`) : null;
    const isOverdue = deadlineDate !== null && !Number.isNaN(deadlineDate.getTime()) && deadlineDate.getTime() < today.getTime() && task.status !== "Completed";
    const matchesFilter = activeFilter === "All" || (activeFilter === "Overdue" ? isOverdue : task.status === activeFilter);
    const searchValue = search.toLowerCase().trim();
    const matchesPriority = priorityFilter === "All" || task.priority === priorityFilter;
    const matchesSearch = task.title.toLowerCase().includes(searchValue) || task.description.toLowerCase().includes(searchValue) || task.assignedTo.toLowerCase().includes(searchValue) || (task.deadline ?? "").toLowerCase().includes(searchValue);
    return matchesFilter && matchesPriority && matchesSearch;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === "deadline") {
      const aDeadline = a.deadline ? new Date(`${a.deadline}T00:00:00`).getTime() : Number.POSITIVE_INFINITY;
      const bDeadline = b.deadline ? new Date(`${b.deadline}T00:00:00`).getTime() : Number.POSITIVE_INFINITY;
      return (Number.isNaN(aDeadline) ? Number.POSITIVE_INFINITY : aDeadline) - (Number.isNaN(bDeadline) ? Number.POSITIVE_INFINITY : bDeadline);
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

  function handleCreateTask(data: { title: string; description: string; priority: "Low" | "Medium" | "High"; assignedTo: string; deadline: string }) {
    createTask(data);
    setTasks(getTasks());
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-indigo-400/20 bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 p-6 shadow-xl shadow-indigo-950/20 sm:p-7">
        <div className="pointer-events-none absolute -right-8 -top-12 size-48 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">
              <ListTodo size={14} /> NEXO WORKSPACE
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Task Management</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Create, organize, track, and complete work across your NEXO workspace.</p>
          </div>
          {canCreateTasks && <button type="button" onClick={() => setIsCreateModalOpen(true)} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-200">
            <Plus size={18} /> Add Task
          </button>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {taskStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`rounded-2xl border ${stat.border} bg-slate-900 p-5 transition hover:-translate-y-0.5 hover:bg-slate-800/80`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-400">{stat.label}</p>
                <div className={`flex size-11 items-center justify-center rounded-xl ${stat.tile} ${stat.color}`}><Icon size={21} /></div>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-white">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-500">{stat.note}</p>
            </div>
          );
        })}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/10">
        <div className="flex flex-col gap-4 border-b border-slate-800 bg-slate-900/80 p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-sm">
              <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, description, user..." className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10" />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative sm:w-52">
                <ArrowUpDown size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value as SortOption)} aria-label="Sort tasks" className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-white outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10">
                  <option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="deadline">Nearest deadline</option><option value="priority">Highest priority</option>
                </select>
              </div>
              <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value as PriorityFilter)} aria-label="Filter by priority" className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10">
                <option value="All">All priorities</option><option value="High">High priority</option><option value="Medium">Medium priority</option><option value="Low">Low priority</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {filters.map((filter) => {
              const isActive = activeFilter === filter;
              return <button key={filter} type="button" onClick={() => setActiveFilter(filter)} className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition ${isActive ? "bg-cyan-300 text-slate-950" : "border border-slate-700 bg-slate-950 text-slate-400 hover:border-cyan-400/30 hover:bg-cyan-400/10 hover:text-cyan-200"}`}>{filter}</button>;
            })}
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {sortedTasks.length > 0 ? (
            <div className="grid gap-4">{sortedTasks.map((task) => <TaskCard key={task.id} id={task.id} title={task.title} description={task.description} status={task.status} priority={task.priority} assignedTo={task.assignedTo} deadline={task.deadline} />)}</div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 px-6 py-16 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-indigo-400/10 text-indigo-300"><ListTodo size={22} /></div>
              <h3 className="mt-4 text-base font-semibold text-white">No tasks found</h3>
              <p className="mt-2 text-sm text-slate-500">Try changing your search or filter.</p>
            </div>
          )}
        </div>
      </section>

      <CreateTaskModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreate={handleCreateTask} />
    </div>
  );
}
