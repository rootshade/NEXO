"use client";

import { useEffect, useState } from "react";
import { LockKeyhole, RotateCcw, Save, ShieldCheck } from "lucide-react";

const BUILT_IN_ROLES = ["Super Admin", "Admin", "Manager", "User"];
const ROLES_KEY = "nexo-roles";
const ROLES_EVENT = "nexo-roles-updated";
const PERMISSIONS_KEY = "nexo-permissions";
const permissionItems = [
  { id: "dashboard", label: "View dashboard" },
  { id: "tasks.view", label: "View tasks" },
  { id: "tasks.create", label: "Create tasks" },
  { id: "tasks.edit", label: "Edit tasks" },
  { id: "tasks.delete", label: "Delete tasks" },
  { id: "letters", label: "Access letters" },
  { id: "messages", label: "Access messages" },
  { id: "users", label: "Manage users" },
  { id: "roles", label: "Manage roles" },
  { id: "permissions", label: "Manage permissions" },
  { id: "settings", label: "Access settings" },
] as const;
type PermissionId = typeof permissionItems[number]["id"];
type PermissionMap = Record<PermissionId, boolean>;
type Matrix = Record<string, PermissionMap>;

function readRoleNames(): string[] {
  try {
    const raw = window.localStorage.getItem(ROLES_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    const custom = Array.isArray(parsed)
      ? parsed.map((item) => item && typeof item.name === "string" ? item.name.trim() : "").filter(Boolean)
      : [];
    return Array.from(new Set([...BUILT_IN_ROLES, ...custom]));
  } catch {
    return BUILT_IN_ROLES;
  }
}

function defaults(roleNames: string[]): Matrix {
  const matrix: Matrix = {};
  for (const role of roleNames) {
    matrix[role] = Object.fromEntries(permissionItems.map((permission) => {
      if (role === "Super Admin") return [permission.id, true];
      if (role === "Admin") return [permission.id, permission.id !== "permissions"];
      if (role === "Manager") return [permission.id, ["dashboard", "tasks.view", "tasks.create", "tasks.edit", "letters", "messages", "settings"].includes(permission.id)];
      return [permission.id, ["dashboard", "tasks.view", "letters", "messages", "settings"].includes(permission.id)];
    })) as PermissionMap;
  }
  return matrix;
}

function load(roleNames: string[]): Matrix {
  const base = defaults(roleNames);
  try {
    const saved: unknown = JSON.parse(window.localStorage.getItem(PERMISSIONS_KEY) || "null");
    if (saved && typeof saved === "object") {
      for (const role of roleNames) {
        const value = (saved as Record<string, unknown>)[role];
        if (value && typeof value === "object") {
          for (const permission of permissionItems) {
            const setting = (value as Record<string, unknown>)[permission.id];
            if (typeof setting === "boolean" && role !== "Super Admin") base[role][permission.id] = setting;
          }
        }
      }
    }
  } catch {
    // Invalid browser data falls back to the safe defaults above.
  }
  base["Super Admin"] = Object.fromEntries(permissionItems.map((permission) => [permission.id, true])) as PermissionMap;
  return base;
}

export default function PermissionsPage() {
  const [roleNames, setRoleNames] = useState<string[]>(BUILT_IN_ROLES);
  const [matrix, setMatrix] = useState<Matrix>(() => defaults(BUILT_IN_ROLES));
  const [selectedRole, setSelectedRole] = useState("Admin");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const refresh = () => {
      const names = readRoleNames();
      setRoleNames(names);
      setMatrix(load(names));
      setSelectedRole((current) => names.includes(current) ? current : (names.includes("Admin") ? "Admin" : names[0]));
    };
    const timer = window.setTimeout(refresh, 0);
    window.addEventListener("storage", refresh);
    window.addEventListener(ROLES_EVENT, refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", refresh);
      window.removeEventListener(ROLES_EVENT, refresh);
    };
  }, []);

  const activePermissions = matrix[selectedRole] ?? defaults([selectedRole])[selectedRole];

  function toggle(id: PermissionId) {
    if (selectedRole === "Super Admin") return;
    setMatrix((current) => ({
      ...current,
      [selectedRole]: { ...(current[selectedRole] ?? activePermissions), [id]: !(current[selectedRole] ?? activePermissions)[id] },
    }));
    setMessage("");
  }

  function save() {
    try {
      const next = { ...matrix, ...defaults(["Super Admin"]) };
      window.localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(next));
      setMatrix(next);
      setMessage("Permissions saved in this browser.");
    } catch {
      setMessage("Unable to save. Check browser storage.");
    }
  }

  function reset() {
    setMatrix(defaults(roleNames));
    setMessage("Default permissions restored. Save to keep these changes.");
  }

  return <div className="space-y-6">
    <header className="relative overflow-hidden rounded-2xl border border-indigo-400/20 bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 p-6 sm:p-7">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-200"><LockKeyhole size={14} /> Access matrix</div>
      <h1 className="text-2xl font-bold text-white sm:text-3xl">Permissions</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Choose a role and configure its access to NEXO sections. Super Admin always has every permission enabled.</p>
    </header>
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-xs"><label htmlFor="permission-role" className="mb-2 block text-sm font-medium text-slate-300">Select role</label><select id="permission-role" value={selectedRole} onChange={(event) => { setSelectedRole(event.target.value); setMessage(""); }} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60">{roleNames.map((role) => <option key={role} value={role}>{role}</option>)}</select></div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3"><ShieldCheck size={17} className="text-cyan-300" /><span className="text-sm text-slate-300"><strong className="text-white">{permissionItems.filter((permission) => activePermissions[permission.id]).length}</strong> of {permissionItems.length} enabled</span></div>
      </div>
      <div className="mt-5 overflow-hidden rounded-xl border border-slate-800">
        <div className="grid grid-cols-[minmax(0,1fr)_100px] bg-slate-950/80 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"><span>Permission</span><span className="text-center">Access</span></div>
        <div className="divide-y divide-slate-800/80">{permissionItems.map((permission) => {
          const checked = !!activePermissions[permission.id];
          const locked = selectedRole === "Super Admin";
          return <div key={permission.id} className="grid grid-cols-[minmax(0,1fr)_100px] items-center gap-3 px-4 py-4 transition hover:bg-slate-800/30">
            <span className="text-sm font-medium text-white">{permission.label}</span>
            <div className="flex justify-center"><button type="button" role="switch" aria-checked={checked} aria-label={permission.label} disabled={locked} onClick={() => toggle(permission.id)} className={`relative h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-300/40 disabled:cursor-not-allowed ${checked ? "bg-cyan-300" : "bg-slate-700"}`}><span className={`absolute left-1 top-1 size-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} /></button></div>
          </div>;
        })}</div>
      </div>
      {message && <p role="status" className="mt-4 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300">{message}</p>}
      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"><button onClick={reset} type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800"><RotateCcw size={15} /> Reset defaults</button><button onClick={save} type="button" className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-200"><Save size={16} /> Save Permissions</button></div>
    </section>
    <p className="flex items-start gap-2 rounded-xl border border-amber-400/15 bg-amber-400/5 px-4 py-3 text-xs leading-5 text-slate-400"><LockKeyhole size={15} className="mt-0.5 shrink-0 text-amber-300" /> Prototype only: these settings are saved in localStorage and do not enforce access to pages or APIs. Backend authorization is required before production.</p>
  </div>;
}
