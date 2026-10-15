"use client";

import { useEffect, useState } from "react";

const DEFAULT_NAME = "Mohammad";
const SETTINGS_KEY = "nexo-settings";

function getSavedName(): string {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_NAME;

    const settings: unknown = JSON.parse(raw);
    if (
      settings &&
      typeof settings === "object" &&
      "fullName" in settings &&
      typeof settings.fullName === "string" &&
      settings.fullName.trim()
    ) {
      return settings.fullName.trim();
    }
  } catch {
    // Keep the dashboard usable if saved settings are unavailable.
  }

  return DEFAULT_NAME;
}

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function WelcomeSection() {
  const [name, setName] = useState(DEFAULT_NAME);
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    const refreshWelcome = () => {
      setName(getSavedName());
      setGreeting(getGreeting());
    };

    const timer = window.setTimeout(refreshWelcome, 0);
    window.addEventListener("focus", refreshWelcome);
    window.addEventListener("storage", refreshWelcome);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("focus", refreshWelcome);
      window.removeEventListener("storage", refreshWelcome);
    };
  }, []);

  return (
    <section className="rounded-2xl border border-indigo-400/15 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-400">Welcome back</p>

          <h2 className="mt-1 text-2xl font-bold text-white">
            {greeting}, {name} 👋
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Here’s what’s happening in your workspace today.
          </p>
        </div>
      </div>
    </section>
  );
}