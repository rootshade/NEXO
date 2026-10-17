"use client";

import { useEffect, useState } from "react";
import { LockKeyhole, RotateCcw, Save, ShieldCheck } from "lucide-react";

const roles = ["Super Admin", "Admin", "Manager", "User"] as const;
const permissions = [
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
type Role = typeof roles[number];
type Matrix = Record<Role, Record<string, boolean>>;
const key = "nexo-permissions";

function defaults(): Matrix {
  return {
    "Super Admin": Object.fromEntries(permissions.map((p) => [p.id, true])) as Record<string, boolean>,
    Admin: Object.fromEntries(permissions.map((p) => [p.id, p.id !== "permissions"])) as Record<string, boolean>,
    Manager: Object.fromEntries(permissions.map((p) => [p.id, ["dashboard", "tasks.view", "tasks.create", "tasks.edit", "letters", "messages", "settings"].includes(p.id)])) as Record<string, boolean>,
    User: Object.fromEntries(permissions.map((p) => [p.id, ["dashboard", "tasks.view", "letters", "messages", "settings"].includes(p.id)])) as Record<string, boolean>,
  };
}

function load(): Matrix {
  const base = defaults();
  try {
    const saved = JSON.parse(window.localStorage.getItem(key) || "null") as Partial<Matrix> | null;
    if (saved) for (const role of roles) if (saved[role]) base[role] = { ...base[role], ...saved[role] };
  } catch {}
  base["Super Admin"] = Object.fromEntries(permissions.map((p) => [p.id, true]));
  return base;
}

export default function PermissionsPage() {
  const [matrix, setMatrix] = useState<Matrix>(defaults);
  const [selectedRole, setSelectedRole] = useState<Role>("Admin");
  const [message, setMessage] = useState("");
  useEffect(() => {
    const timer = window.setTimeout(() => setMatrix(load()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  function toggle(id: string) {
    if (selectedRole === "Super Admin") return;
    setMatrix((current) => ({ ...current, [selectedRole]: { ...current[selectedRole], [id]: !current[selectedRole][id] } }));
    setMessage("");
  }
  function save() {
    try {
      const next = { ...matrix, "Super Admin": Object.fromEntries(permissions.map((p) => [p.id, true])) } as Matrix;
      window.localStorage.setItem(key, JSON.stringify(next));
      setMatrix(next);
      setMessage("Permissions saved in this browser.");
    } catch {
      setMessage("Unable to save. Check browser storage.");
    }
  }
  function reset() { setMatrix(defaults()); setMessage(""); }

  return <div className="space-y-6">
    <header className="relative overflow-hidden rounded-2xl border border-indigo-400/20 bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 p-6 sm:p-7">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-200"><LockKeyhole size={14} /> Access matrix</div>
      <h1 className="text-2xl font-bold text-white sm:text-3xl">Permissions</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Choose a role and configure its access to NEXO sections. Super Admin always has every permission enabled.</p>
    </header>
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full sm:max-w-xs"><label htmlFor="permission-role" className="mb-2 block text-sm font-medium text-slate-300">Select role</label><select id="permission-role" value={selectedRole} onChange={(e) => { setSelectedRole(e.target.value as Role); setMessage(""); }} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60">{roles.map((role) => <option key={role}>{role}</option>)}</select></div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-3"><ShieldCheck size={17} className="text-cyan-300" /><span className="text-sm text-slate-300"><strong className="text-white">{permissions.filter((p) => matrix[selectedRole][p.id]).length}</strong> of {permissions.length} enabled</span></div>
      </div>
      <div className="mt-5 overflow-hidden rounded-xl border border-slate-800">
        <div className="grid grid-cols-[minmax(0,1fr)_100px] bg-slate-950/80 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"><span>Permission</span><span className="text-center">Access</span></div>
        <div className="divide-y divide-slate-800/80">{permissions.map((p) => {
          const checked = matrix[selectedRole][p.id];
          const locked = selectedRole === "Super Admin";
          return <div key={p.id} className="grid grid-cols-[minmax(0,1fr)_100px] items-center gap-3 px-4 py-4 transition hover:bg-slate-800/30">
            <span className="text-sm font-medium text-white">{p.label}</span>
            <div className="flex justify-center"><button type="button" role="switch" aria-checked={checked} aria-label={p.label} disabled={locked} onClick={() => toggle(p.id)} className={`relative h-6 w-11 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-300/40 disabled:cursor-not-allowed ${checked ? "bg-cyan-300" : "bg-slate-700"}`}><span className={`absolute left-1 top-1 size-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`} /></button></div>
          </div>;
        })}</div>
      </div>
      {message && <p role="status" className="mt-4 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300">{message}</p>}
      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between"><button onClick={reset} type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800"><RotateCcw size={15} /> Reset defaults</button><button onClick={save} type="button" className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-cyan-200"><Save size={16} /> Save Permissions</button></div>
    </section>
    <p className="flex items-start gap-2 rounded-xl border border-amber-400/15 bg-amber-400/5 px-4 py-3 text-xs leading-5 text-slate-400"><LockKeyhole size={15} className="mt-0.5 shrink-0 text-amber-300" /> Prototype only: these settings are saved in localStorage and do not enforce access to pages or APIs. Backend authorization is required before production.</p>
  </div>;
}
