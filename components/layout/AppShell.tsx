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
    <div className="min-h-screen bg-slate-950">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <div className="md:ml-64">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
