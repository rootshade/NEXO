"use client";

import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { canAccess, CURRENT_USER_EVENT, getCurrentUser, permissionForPath } from "@/data/accessControl";

import Sidebar from "./Sidebar";
import Header from "../Header";

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({
  children,
}: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const [accessRevision, setAccessRevision] = useState(0);

  useEffect(() => {
    const refresh = () => setAccessRevision((value) => value + 1);
    window.addEventListener(CURRENT_USER_EVENT, refresh);
    window.addEventListener("nexo-permissions-updated", refresh);
    window.addEventListener("nexo-users-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(CURRENT_USER_EVENT, refresh);
      window.removeEventListener("nexo-permissions-updated", refresh);
      window.removeEventListener("nexo-users-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  void accessRevision;
  const currentUser = typeof window !== "undefined" ? getCurrentUser() : null;
  const requiredPermission = permissionForPath(pathname);
  const hasPageAccess = !requiredPermission || !currentUser || canAccess(currentUser, requiredPermission);

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
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="relative min-h-screen p-4 sm:p-6">
          {hasPageAccess ? children : (
            <section className="mx-auto mt-16 max-w-lg rounded-2xl border border-rose-400/20 bg-slate-900 p-8 text-center shadow-xl">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-400/10 text-rose-300"><span className="text-2xl">⛔</span></div>
              <h1 className="mt-5 text-xl font-bold text-white">Access denied</h1>
              <p className="mt-2 text-sm leading-6 text-slate-400">Your current role does not have permission to open this page. Ask an administrator to update your role permissions.</p>
              <Link href="/dashboard" className="mt-6 inline-flex rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-200">Back to Dashboard</Link>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
