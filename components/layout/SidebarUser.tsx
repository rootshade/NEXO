"use client";

import { useEffect, useState } from "react";
import { ChevronDown, UserRound } from "lucide-react";
import {
  AccessUser, CURRENT_USER_EVENT, CURRENT_USER_KEY, getCurrentUser, getUsers, SUPER_ADMIN_ID,
} from "@/data/accessControl";

export default function SidebarUser() {
  const [users, setUsers] = useState<AccessUser[]>([]);
  const [currentUser, setCurrentUser] = useState<AccessUser | null>(null);

  useEffect(() => {
    const refresh = () => {
      const available = getUsers();
      setUsers(available);
      setCurrentUser(getCurrentUser());
      if (!window.localStorage.getItem(CURRENT_USER_KEY)) {
        window.localStorage.setItem(CURRENT_USER_KEY, SUPER_ADMIN_ID);
      }
    };
    const timer = window.setTimeout(refresh, 0);
    window.addEventListener("storage", refresh);
    window.addEventListener("nexo-users-updated", refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("nexo-users-updated", refresh);
    };
  }, []);

  function switchUser(id: string) {
    window.localStorage.setItem(CURRENT_USER_KEY, id);
    setCurrentUser(getUsers().find((user) => user.id === id) ?? getCurrentUser());
    window.dispatchEvent(new CustomEvent(CURRENT_USER_EVENT));
  }

  return (
    <div className="border-t border-slate-800 p-4">
      <label htmlFor="nexo-current-user" className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">Prototype account</label>
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-white">
          {currentUser?.name.trim().charAt(0).toUpperCase() || <UserRound size={17} />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">{currentUser?.name ?? "Loading account…"}</p>
          <p className="truncate text-xs text-slate-400">{currentUser?.role ?? " "}</p>
          <div className="relative mt-2">
            <select id="nexo-current-user" aria-label="Switch prototype account" value={currentUser?.id ?? ""} onChange={(event) => switchUser(event.target.value)} className="w-full appearance-none rounded-lg border border-slate-700 bg-slate-900 py-1.5 pl-2 pr-7 text-xs text-slate-300 outline-none focus:border-cyan-400/50">
              {users.filter((user) => user.status === "Active").map((user) => <option key={user.id} value={user.id}>{user.name} — {user.role}</option>)}
            </select>
            <ChevronDown size={13} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-500" />
          </div>
        </div>
      </div>
    </div>
  );
}
