"use client";

import { useEffect, useMemo, useState } from "react";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import { canAccess, getCurrentUser } from "@/data/accessControl";
import { readUsers as readStoredUsers, writeUsers } from "@/data/userStorage.cjs";
import {
  BadgeCheck,
  Check,
  Crown,
  Edit2,
  Mail,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  UserX,
  UsersRound,
  X,
} from "lucide-react";

type UserStatus = "Active" | "Inactive";
type UserRole = string;

type AppUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
};

const STORAGE_KEY = "nexo-users";
const USER_EVENT = "nexo-users-updated";
const SUPER_ADMIN_ID = "user-mohammad";
const DEFAULT_USERS: AppUser[] = [
  { id: SUPER_ADMIN_ID, name: "Mohammad", email: "mohammad@nexo.local", role: "Super Admin", status: "Active", createdAt: "2026-01-01" },
  { id: "user-ali", name: "Ali", email: "ali@nexo.local", role: "User", status: "Active", createdAt: "2026-01-02" },
  { id: "user-sara", name: "Sara", email: "sara@nexo.local", role: "Manager", status: "Active", createdAt: "2026-01-03" },
];

const DEFAULT_ROLE_NAMES = ["Super Admin", "Admin", "Manager", "User"];
const ROLES_STORAGE_KEY = "nexo-roles";
const ROLES_EVENT = "nexo-roles-updated";

function readRoleNames(): string[] {
  try {
    const raw = window.localStorage.getItem(ROLES_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    const names = Array.isArray(parsed) ? parsed.map((item) => item && typeof item.name === "string" ? item.name.trim() : "").filter(Boolean) : [];
    return Array.from(new Set([...DEFAULT_ROLE_NAMES, ...names]));
  } catch {
    return DEFAULT_ROLE_NAMES;
  }
}

function ensureSuperAdmin(users: AppUser[]): AppUser[] {
  if (users.some((user) => user.id === SUPER_ADMIN_ID && user.role === "Super Admin")) {
    return users;
  }
  return [DEFAULT_USERS[0], ...users];
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] ?? "").join("").toUpperCase() || "?";
}

function roleStyle(role: UserRole) {
  switch (role) {
    case "Super Admin":
      return { badge: "border-amber-400/30 bg-amber-400/10 text-amber-300", avatar: "from-amber-400 to-orange-500", Icon: Crown };
    case "Admin":
      return { badge: "border-violet-400/30 bg-violet-400/10 text-violet-300", avatar: "from-violet-500 to-purple-600", Icon: ShieldCheck };
    case "Manager":
      return { badge: "border-sky-400/30 bg-sky-400/10 text-sky-300", avatar: "from-sky-500 to-cyan-500", Icon: BadgeCheck };
    default:
      return { badge: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300", avatar: "from-emerald-500 to-teal-500", Icon: UserRound };
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>(DEFAULT_ROLE_NAMES);
  const [canManageUsers, setCanManageUsers] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | UserStatus>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("User");
  const [formError, setFormError] = useState("");
  const [pendingDeleteUser, setPendingDeleteUser] = useState<AppUser | null>(null);

  useEffect(() => {
    const refresh = () => {
      const result = readStoredUsers(window.localStorage, STORAGE_KEY, DEFAULT_USERS);
      if (result.ok) {
        setUsers(ensureSuperAdmin(result.value));
        setStorageReady(true);
        setStorageError("");
      } else {
        setUsers(DEFAULT_USERS);
        setStorageReady(false);
        setStorageError("Saved user data could not be read safely. Editing is paused to protect the existing data.");
      }
      setAvailableRoles(readRoleNames());
      setCanManageUsers(canAccess(getCurrentUser(), "users"));
    };
    const timer = window.setTimeout(refresh, 0);
    window.addEventListener("storage", refresh);
    window.addEventListener(USER_EVENT, refresh);
    window.addEventListener(ROLES_EVENT, refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", refresh);
      window.removeEventListener(USER_EVENT, refresh);
      window.removeEventListener(ROLES_EVENT, refresh);
    };
  }, []);

  function persist(nextUsers: AppUser[]): boolean {
    if (!storageReady) {
      setFormError("User storage is not ready. Refresh the page and try again.");
      return false;
    }
    const result = writeUsers(window.localStorage, STORAGE_KEY, nextUsers);
    if (!result.ok) {
      setFormError(result.reason === "invalid_data"
        ? "The user list failed validation and was not saved."
        : "Unable to save users in this browser. Check available storage.");
      return false;
    }
    setUsers(nextUsers);
    window.dispatchEvent(new CustomEvent(USER_EVENT));
    setFormError("");
    return true;
  }

  function openCreate() {
    if (!canManageUsers) return;
    setEditingId(null);
    setName("");
    setEmail("");
    setRole("User");
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(user: AppUser) {
    if (!canManageUsers) return;
    setEditingId(user.id);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setFormError("");
    setModalOpen(true);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManageUsers) {
      setFormError("You do not have permission to manage users.");
      return;
    }
    setFormError("");
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      setFormError("Please enter the user's name and email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setFormError("Enter a valid email address.");
      return;
    }
    if (users.some((user) => user.email.toLowerCase() === cleanEmail && user.id !== editingId)) {
      setFormError("A user with this email already exists.");
      return;
    }

    let didSave = false;
    if (editingId) {
      const existing = users.find((user) => user.id === editingId);
      if (!existing) return;
      // Super Admin identity and role cannot be changed from this screen.
      const isProtectedAdmin = existing.id === SUPER_ADMIN_ID || existing.role === "Super Admin";
      const nextRole = isProtectedAdmin ? "Super Admin" : role;
      didSave = persist(users.map((user) => user.id === editingId
        ? { ...user, name: cleanName, email: cleanEmail, role: nextRole, status: isProtectedAdmin ? "Active" : user.status }
        : user));
    } else {
      const newUser: AppUser = {
        id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `user-${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        role: role === "Super Admin" ? "Admin" : role,
        status: "Active",
        createdAt: new Date().toISOString().slice(0, 10),
      };
      didSave = persist([newUser, ...users]);
    }
    if (didSave) setModalOpen(false);
  }

  function toggleStatus(user: AppUser) {
    if (!canManageUsers) return;
    if (user.id === SUPER_ADMIN_ID || user.role === "Super Admin") return;
    persist(users.map((item) => item.id === user.id ? { ...item, status: item.status === "Active" ? "Inactive" : "Active" } : item));
  }

  function deleteUser(user: AppUser) {
    if (!canManageUsers) return;
    if (user.id === SUPER_ADMIN_ID || user.role === "Super Admin") return;
    setPendingDeleteUser(user);
  }

  function confirmDeleteUser() {
    if (!pendingDeleteUser) return;
    persist(users.filter((item) => item.id !== pendingDeleteUser.id));
    setPendingDeleteUser(null);
  }

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch = !query || user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query) || user.role.toLowerCase().includes(query);
      return matchesSearch && (statusFilter === "All" || user.status === statusFilter);
    });
  }, [users, search, statusFilter]);

  const activeCount = users.filter((user) => user.status === "Active").length;
  const inactiveCount = users.length - activeCount;
  const superAdminCount = users.filter((user) => user.role === "Super Admin").length;

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-indigo-400/20 bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 p-6 sm:p-7">
        <div className="pointer-events-none absolute -right-8 -top-12 size-48 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-medium text-cyan-200">
              <UsersRound size={14} /> Workspace directory
            </div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">User Management</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Manage people, assign roles, and control account status from one place.</p>
          </div>
          <button type="button" onClick={openCreate} disabled={!canManageUsers || !storageReady} title={!canManageUsers ? "You do not have permission to manage users" : !storageReady ? "User storage is unavailable" : "Add a user"} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-cyan-950/30 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40">
            <Plus size={18} /> Add User
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Users", value: users.length, icon: UsersRound, color: "text-indigo-300", tile: "bg-indigo-400/10", border: "border-indigo-400/20" },
          { label: "Active Users", value: activeCount, icon: Check, color: "text-emerald-300", tile: "bg-emerald-400/10", border: "border-emerald-400/20" },
          { label: "Inactive Users", value: inactiveCount, icon: UserX, color: "text-rose-300", tile: "bg-rose-400/10", border: "border-rose-400/20" },
          { label: "Super Admins", value: superAdminCount, icon: Crown, color: "text-amber-300", tile: "bg-amber-400/10", border: "border-amber-400/20" },
        ].map((stat) => {
          const Icon = stat.icon;
          return <div key={stat.label} className={`rounded-2xl border ${stat.border} bg-slate-900 p-5 transition hover:-translate-y-0.5 hover:bg-slate-800/80`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-400">{stat.label}</p>
              <div className={`flex size-11 items-center justify-center rounded-xl ${stat.tile} ${stat.color}`}><Icon size={21} /></div>
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-white">{stat.value}</p>
            <p className="mt-1 text-xs text-slate-500">{stat.label === "Super Admins" ? "Protected accounts" : "Across this workspace"}</p>
          </div>;
        })}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/10">
        <div className="flex flex-col gap-3 border-b border-slate-800 bg-slate-900/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="relative w-full sm:max-w-sm">
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, or role..." className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10" />
          </div>
          <select aria-label="Filter by user status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "All" | UserStatus)} className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan-400/60">
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {filteredUsers.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-slate-950/70 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-medium">User</th>
                  <th className="px-5 py-4 font-medium">Role / Access</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Joined</th>
                  <th className="px-5 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredUsers.map((user) => {
                  const isSuperAdmin = user.id === SUPER_ADMIN_ID || user.role === "Super Admin";
                  const style = roleStyle(user.role);
                  const RoleIcon = style.Icon;
                  return <tr key={user.id} className="group transition-colors hover:bg-slate-800/35">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${style.avatar} text-xs font-bold text-white shadow-lg`}>{initials(user.name)}</div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                            {isSuperAdmin && <span className="rounded-md bg-amber-300/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-300">Protected</span>}
                          </div>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Mail size={12} />{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${style.badge}`}><RoleIcon size={13} />{user.role}</span>
                      <p className="mt-1.5 text-[11px] text-slate-500">{user.role === "Super Admin" ? "Full workspace control" : user.role === "Admin" ? "Administrative access" : user.role === "Manager" ? "Team management" : "Standard access"}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold ${user.status === "Active" ? "bg-emerald-400/10 text-emerald-300" : "bg-slate-800 text-slate-400"}`}><span className={`size-1.5 rounded-full ${user.status === "Active" ? "bg-emerald-400" : "bg-slate-500"}`} />{user.status}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">{user.createdAt}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={() => openEdit(user)} disabled={!canManageUsers} aria-label={`Edit ${user.name}`} title={!canManageUsers ? "No permission to manage users" : "Edit user"} className="rounded-lg border border-slate-700 p-2.5 text-slate-300 transition hover:border-cyan-400/40 hover:bg-cyan-400/10 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-30"><Edit2 size={15} /></button>
                        <button type="button" onClick={() => toggleStatus(user)} disabled={!canManageUsers || isSuperAdmin} title={!canManageUsers ? "No permission to manage users" : isSuperAdmin ? "Super Admin cannot be deactivated" : user.status === "Active" ? "Deactivate user" : "Activate user"} className="rounded-lg border border-slate-700 p-2.5 text-slate-300 transition hover:border-violet-400/40 hover:bg-violet-400/10 hover:text-violet-200 disabled:cursor-not-allowed disabled:opacity-30"><UserX size={15} /></button>
                        <button type="button" onClick={() => deleteUser(user)} disabled={!canManageUsers || isSuperAdmin} title={!canManageUsers ? "No permission to manage users" : isSuperAdmin ? "Super Admin cannot be deleted" : "Delete user"} className="rounded-lg border border-rose-500/20 p-2.5 text-rose-300 transition hover:border-rose-400/50 hover:bg-rose-400/10 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-25"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>;
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-800 text-slate-500"><UserRound size={24} /></div>
            <p className="mt-3 text-sm font-semibold text-white">No users found</p>
            <p className="mt-1 text-sm text-slate-500">Try a different search or add a new user.</p>
          </div>
        )}
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}>
          <form onSubmit={handleSubmit} className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-slate-800 bg-gradient-to-r from-indigo-950/70 to-slate-900 px-6 py-5">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-white"><span className="flex size-9 items-center justify-center rounded-xl bg-indigo-400/10 text-indigo-300"><UserRound size={18} /></span>{editingId ? "Edit User" : "Add User"}</h2>
                <p className="mt-2 text-sm text-slate-400">Enter the user&apos;s basic account information.</p>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} aria-label="Close dialog" className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"><X size={19} /></button>
            </div>
            <div className="space-y-4 px-6 py-6">
              <div>
                <label htmlFor="user-name" className="mb-2 block text-sm font-medium text-slate-300">Full name</label>
                <input id="user-name" autoFocus required value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10" placeholder="e.g. Alex Morgan" />
              </div>
              <div>
                <label htmlFor="user-email" className="mb-2 block text-sm font-medium text-slate-300">Email</label>
                <input id="user-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10" placeholder="name@example.com" />
              </div>
              <div>
                <label htmlFor="user-role" className="mb-2 block text-sm font-medium text-slate-300">Role</label>
                <select id="user-role" disabled={users.some((user) => user.id === editingId && (user.id === SUPER_ADMIN_ID || user.role === "Super Admin"))} value={users.some((user) => user.id === editingId && (user.id === SUPER_ADMIN_ID || user.role === "Super Admin")) ? "Super Admin" : role} onChange={(event) => setRole(event.target.value as UserRole)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/60 disabled:cursor-not-allowed disabled:opacity-60">
                  {(users.some((user) => user.id === editingId && (user.id === SUPER_ADMIN_ID || user.role === "Super Admin")) ? ["Super Admin"] : availableRoles.filter((item) => item !== "Super Admin")).map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                {users.some((user) => user.id === editingId && (user.id === SUPER_ADMIN_ID || user.role === "Super Admin")) && <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-300"><ShieldCheck size={13} /> Super Admin role is protected and cannot be changed.</p>}
              </div>
              {formError && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{formError}</p>}
            </div>
            <div className="flex flex-col-reverse gap-3 border-t border-slate-800 bg-slate-950/40 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">Super Admin is a protected account.</p>
              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white">Cancel</button>
                <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"><Check size={16} />{editingId ? "Save Changes" : "Create User"}</button>
              </div>
            </div>
          </form>
        </div>
      )}
      <p className="flex items-start gap-2 rounded-xl border border-amber-400/15 bg-amber-400/5 px-4 py-3 text-xs leading-5 text-slate-400"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-amber-300" /> Prototype only: data is stored in this browser. The Super Admin protection here is UI-side only; backend authorization must enforce the same rule before production.</p>
      <ConfirmDeleteModal open={pendingDeleteUser !== null} title="Delete user?" description="This cannot be undone in this browser. User:" itemName={pendingDeleteUser?.name} onCancel={() => setPendingDeleteUser(null)} onConfirm={confirmDeleteUser} />
  </div>
  );
}
