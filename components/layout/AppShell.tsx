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
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(ellipse_at_top_left,rgba(79,70,229,0.12),transparent_35%),radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.08),transparent_30%),#070b16]">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <div className="md:ml-64">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="relative min-h-[calc(100vh-4rem)] p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
