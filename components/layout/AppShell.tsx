"use client";

import { useEffect, useState } from "react";

import Sidebar from "./Sidebar";
import Header from "../Header";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({
  children,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSidebarOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-w-0 flex-1">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}