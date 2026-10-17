"use client";

import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

import Sidebar from "./Sidebar";

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
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top_left,rgba(79,70,229,0.12),transparent_35%),radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.08),transparent_30%),#070b16]">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Mobile menu button - replaces the old top header */}
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setSidebarOpen(true)}
        className="fixed left-4 top-4 z-30 flex size-10 items-center justify-center rounded-xl border border-indigo-400/20 bg-slate-900/90 text-cyan-200 shadow-lg shadow-black/20 backdrop-blur-md transition hover:border-cyan-400/30 hover:bg-slate-800 md:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Main */}
      <div className="md:ml-64">
        <main className="relative min-h-screen p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
