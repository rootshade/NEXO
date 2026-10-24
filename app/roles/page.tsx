"use client";

import { useEffect, useState } from "react";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import { BadgeCheck, Crown, Edit2, Plus, Shield, ShieldCheck, Trash2, UsersRound, X } from "lucide-react";

type Role = { id: string; name: string; description: string; members: number; protected?: boolean };
const STORAGE_KEY = "nexo-roles";
const ROLES_EVENT = "nexo-roles-updated";
const USERS_KEY = "nexo-users";
const USERS_EVENT = "nexo-users-updated";
const PERMISSIONS_KEY = "nexo-permissions";
const PERMISSIONS_EVENT = "nexo-permissions-updated";
const DEFAULT_ROLES: Role[] = [
  { id: "super-admin", name: "Super Admin", description: "Full workspace control and system configuration.", members: 1, protected: true },
  { id: "admin", name: "Admin", description: "Manage users and workspace operations.", members: 1 },
  { id: "manager", name: "Manager", description: "Coordinate team work and track task progress.", members: 1 },
  { id: "user", name: "User", description: "Access assigned work and personal items.", members: 1, protected: true },
];

function readRoles(): Role[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_ROLES;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_ROLES;
    const valid = parsed.filter((role): role is Role =>
      !!role && typeof role.id === "string" && typeof role.name === "string" &&
      typeof role.description === "string" && typeof role.members === "number"
    );
    for (const protectedRole of DEFAULT_ROLES.filter((role) => role.protected)) {
      if (!valid.some((role) => role.id === protectedRole.id)) valid.push(protectedRole);
    }
    return valid;
  } catch {
    return DEFAULT_ROLES;
  }
}

function readUsers(): Array<{ id: string; role?: string }> {
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((user): user is { id: string; role?: string } => !!user && typeof user === "object" && typeof (user as { id?: unknown }).id === "string") : [];
  } catch {
    return [];
  }
}

function iconFor(name: string) {
  if (name === "Super Admin") return Crown;
  if (name === "Admin") return ShieldCheck;
  if (name === "Manager") return BadgeCheck;
  return Shield;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [pendingDeleteRole, setPendingDeleteRole] = useState<Role | null>(null);

  useEffect(() => {
    const refresh = () => {
      const savedRoles = readRoles();
      const users = readUsers();
      setRoles(savedRoles.map((role) => ({
        ...role,
        members: users.filter((user) => user.role === role.name).length,
      })));
    };
    const timer = window.setTimeout(refresh, 0);
    window.addEventListener("storage", refresh);
    window.addEventListener(USERS_EVENT, refresh);
    window.addEventListener(ROLES_EVENT, refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", refresh);
      window.removeEventListener(USERS_EVENT, refresh);
      window.removeEventListener(ROLES_EVENT, refresh);
    };
  }, []);

  function persist(next: Role[]) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setRoles(next.map((role) => ({ ...role, members: readUsers().filter((user) => user.role === role.name).length })));
      window.dispatchEvent(new CustomEvent(ROLES_EVENT));
      setError("");
    } catch {
      setError("Could not save roles in this browser.");
    }
  }

  function openCreate() {
    setEditingId(null); setName(""); setDescription(""); setError(""); setModalOpen(true);
  }

  function openEdit(role: Role) {
    setEditingId(role.id); setName(role.name); setDescription(role.description); setError(""); setModalOpen(true);
  }

  function syncRenamedRole(oldName: string, newName: string) {
    const users = readUsers();
    const nextUsers = users.map((user) => user.role === oldName ? { ...user, role: newName } : user);
    window.localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));
    window.dispatchEvent(new CustomEvent(USERS_EVENT));

    try {
      const raw = window.localStorage.getItem(PERMISSIONS_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === "object") {
        const matrix = { ...(parsed as Record<string, unknown>) };
        if (Object.prototype.hasOwnProperty.call(matrix, oldName)) {
          matrix[newName] = matrix[oldName];
          delete matrix[oldName];
          window.localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(matrix));
          window.dispatchEvent(new CustomEvent(PERMISSIONS_EVENT));
        }
      }
    } catch {
      // The role itself is still renamed; permissions will use role defaults if saved data is invalid.
    }
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanDescription = description.trim();
    if (!cleanName) { setError("Enter a role name."); return; }
    if (roles.some((role) => role.name.toLowerCase() === cleanName.toLowerCase() && role.id !== editingId)) {
      setError("A role with this name already exists."); return;
    }
    if (editingId) {
      const current = roles.find((role) => role.id === editingId);
      if (!current) return;
      if (current.protected) { setError("This built-in role is protected."); return; }
      if (current.name !== cleanName) syncRenamedRole(current.name, cleanName);
      persist(roles.map((role) => role.id === editingId ? { ...role, name: cleanName, description: cleanDescription } : role));
    } else {
      persist([{ id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `role-${Date.now()}`, name: cleanName, description: cleanDescription, members: 0 }, ...roles]);
    }
    setModalOpen(false);
  }

  function remove(role: Role) {
    if (role.protected) return;
    if (role.members > 0) { setError(`Reassign the ${role.members} user(s) using "${role.name}" before deleting this role.`); return; }
    setPendingDeleteRole(role);
  }

  function confirmDeleteRole() {
    if (!pendingDeleteRole) return;
    const role = pendingDeleteRole;
    persist(roles.filter((item) => item.id !== role.id));
    try {
      const raw = window.localStorage.getItem(PERMISSIONS_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === "object" && Object.prototype.hasOwnProperty.call(parsed, role.name)) {
        const matrix = { ...(parsed as Record<string, unknown>) };
        delete matrix[role.name];
        window.localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(matrix));
        window.dispatchEvent(new CustomEvent(PERMISSIONS_EVENT));
      }
    } catch {
      // Permission cleanup is best-effort for malformed optional data.
    }
    setPendingDeleteRole(null);
  }

  return <div className="space-y-6">
    <div className="relative overflow-hidden rounded-2xl border border-indigo-400/20 bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 p-6 sm:p-7">
      <div className="pointer-events-none absolute -right-8 -top-12 size-48 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-200"><Shield size={14} /> Access control</div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Role Management</h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Create and maintain the roles that describe responsibilities across your workspace.</p>
        </div>
        <button onClick={openCreate} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"><Plus size={18} /> Add Role</button>
      </div>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {roles.map((role) => {
        const Icon = iconFor(role.name);
        return <article key={role.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-700 hover:bg-slate-900/80">
          <div className="flex items-start justify-between gap-3"><div className="flex size-11 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-200"><Icon size={21} /></div>
            {role.protected && <span className="rounded-md bg-amber-300/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-300">Built-in</span>}</div>
          <h2 className="mt-4 text-lg font-semibold text-white">{role.name}</h2>
          <p className="mt-2 min-h-12 text-sm leading-6 text-slate-400">{role.description || "No description provided."}</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500"><UsersRound size={14} /> {role.members} {role.members === 1 ? "member" : "members"}</div>
          <div className="mt-5 flex gap-2 border-t border-slate-800 pt-4">
            <button onClick={() => openEdit(role)} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-200"><Edit2 size={14} /> Edit</button>
            <button onClick={() => remove(role)} disabled={role.protected} title={role.protected ? "Built-in role cannot be deleted" : "Delete role"} className="inline-flex items-center gap-2 rounded-lg border border-rose-500/20 px-3 py-2 text-xs font-medium text-rose-300 transition hover:bg-rose-400/10 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-30"><Trash2 size={14} /> Delete</button>
          </div>
        </article>;
      })}
    </div>
    {error && !modalOpen && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
    <p className="flex items-start gap-2 rounded-xl border border-amber-400/15 bg-amber-400/5 px-4 py-3 text-xs leading-5 text-slate-400"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-amber-300" /> Prototype only: roles are stored in this browser. Role assignments and authorization rules are not enforced by a backend yet.</p>
    {modalOpen && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}>
      <form onSubmit={submit} className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5"><div><h2 className="text-lg font-semibold text-white">{editingId ? "Edit Role" : "Create Role"}</h2><p className="mt-1 text-sm text-slate-400">Define a clear name and purpose for this role.</p></div><button type="button" onClick={() => setModalOpen(false)} aria-label="Close dialog" className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-white"><X size={19} /></button></div>
        <div className="space-y-4 px-6 py-6"><div><label htmlFor="role-name" className="mb-2 block text-sm font-medium text-slate-300">Role name</label><input id="role-name" autoFocus required maxLength={50} value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60" placeholder="e.g. Support Agent" /></div>
          <div><label htmlFor="role-description" className="mb-2 block text-sm font-medium text-slate-300">Description</label><textarea id="role-description" rows={3} maxLength={240} value={description} onChange={(event) => setDescription(event.target.value)} className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60" placeholder="What can this role do?" /></div>
          {editingId && roles.find((role) => role.id === editingId)?.protected && <p className="text-xs text-amber-300">Built-in roles cannot be renamed or reconfigured in this prototype.</p>}
          {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-800 px-6 py-5"><button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800">Cancel</button><button type="submit" disabled={!!(editingId && roles.find((role) => role.id === editingId)?.protected)} className="rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40">{editingId ? "Save Changes" : "Create Role"}</button></div>
      </form>
    </div>}
    <ConfirmDeleteModal open={pendingDeleteRole !== null} title="Delete role?" description="Delete this role:" itemName={pendingDeleteRole?.name} onCancel={() => setPendingDeleteRole(null)} onConfirm={confirmDeleteRole} />
  </div>;
}
