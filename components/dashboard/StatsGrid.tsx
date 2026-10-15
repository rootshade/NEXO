"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckSquare,
  Clock3,
  Mail,
  MessageSquare,
} from "lucide-react";

import { loadTasks } from "@/data/taskStore";
import { initialLetters } from "@/data/letters";
import { initialMessages } from "@/data/messages";
import StatCard from "./StatCard";

type DashboardStats = {
  tasks: number;
  openTasks: number;
  letters: number;
  messages: number;
};

const initialStats: DashboardStats = {
  tasks: 0,
  openTasks: 0,
  letters: 0,
  messages: 0,
};

function readArrayFromStorage<T>(key: string, fallback: T[]): T[] {
  try {
    const saved = window.localStorage.getItem(key);
    if (saved === null) return fallback;

    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as T[]) : fallback;
  } catch {
    return fallback;
  }
}

export default function StatsGrid() {
  const [stats, setStats] = useState<DashboardStats>(initialStats);

  const refreshStats = useCallback(() => {
    const tasks = loadTasks();
    const letters = readArrayFromStorage("nexo-letters", initialLetters);
    const messages = readArrayFromStorage("nexo-messages", initialMessages);

    setStats({
      tasks: tasks.length,
      openTasks: tasks.filter((task) => task.status !== "Completed").length,
      letters: letters.length,
      messages: messages.length,
    });
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(refreshStats, 0);

    window.addEventListener("focus", refreshStats);
    window.addEventListener("storage", refreshStats);
    window.addEventListener("nexo-tasks-updated", refreshStats);
    window.addEventListener("nexo-letters-updated", refreshStats);
    window.addEventListener("nexo-messages-updated", refreshStats);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", refreshStats);
      window.removeEventListener("storage", refreshStats);
      window.removeEventListener("nexo-tasks-updated", refreshStats);
      window.removeEventListener("nexo-letters-updated", refreshStats);
      window.removeEventListener("nexo-messages-updated", refreshStats);
    };
  }, [refreshStats]);

  const cards = [
    {
      title: "Tasks",
      value: stats.tasks,
      description: "All saved tasks",
      icon: CheckSquare,
    },
    {
      title: "Open Tasks",
      value: stats.openTasks,
      description: "Pending or in progress",
      icon: Clock3,
    },
    {
      title: "Letters",
      value: stats.letters,
      description: "All saved letters",
      icon: Mail,
    },
    {
      title: "Messages",
      value: stats.messages,
      description: "All saved messages",
      icon: MessageSquare,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={card.value}
          description={card.description}
          icon={card.icon}
        />
      ))}
    </div>
  );
}
