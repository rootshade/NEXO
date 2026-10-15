"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  Edit2,
  Mail,
  Plus,
  Search,
  Shield,
  UserRound,
  UserX,
  X,
} from "lucide-react";

type UserStatus = "Active" | "Inactive";
type UserRole = "Super Admin" | "Admin" | "Manager" | "User";

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
const DEFAULT_USERS: AppUser[] = [
  { id: "user-mohammad", name: "Mohammad", email: "mohammad@nexo.local", role: "Super Admin", status: "Active", createdAt: "2026-01-01" },
  { id: "user-ali", name: "Ali", email: "ali@nexo.local", role: "User", status: "Active", createdAt: "2026-01-02" },
  { id: "user-sara", name: "Sara", email: "sara@nexo.local", role: "Manager", status: "Active", createdAt: "2026-01-03" },
];

const roles: UserRole[] = ["Super Admin", "Admin", "Manager", "User"];

function readUsers(): AppUser[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_USERS;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_USERS;
    return parsed.filter((item): item is AppUser =>
      !!item &&
      typeof item === "object" &&
      typeof item.id === "string" &&
      typeof item.name === "string" &&
      typeof item.email === "string" &&
      roles.includes(item.role) &&
      (item.status === "Active" || item.status === "Inactive") &&
      typeof item.createdAt === "string"
    );
  } catch {
    return DEFAULT_USERS;
  }
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] ?? "").join("").toUpperCase() || "?";
}

export default function UsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | UserStatus>("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("User");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setUsers(readUsers()), 0);
    const refresh = () => setUsers(readUsers());
    window.addEventListener("storage", refresh);
    window.addEventListener(USER_EVENT, refresh);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", refresh);
      window.removeEventListener(USER_EVENT, refresh);
    };
  }, []);

  function persist(nextUsers: AppUser[]) {
    setUsers(nextUsers);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUsers));
      window.dispatchEvent(new CustomEvent(USER_EVENT));
    } catch {
      setFormError("Unable to save users in this browser. Check available storage.");
    }
  }

  function openCreate() {
    setEditingId(null);
    setName("");
    setEmail("");
    setRole("User");
    setFormError("");
    setModalOpen(true);
  }

  function openEdit(user: AppUser) {
    setEditingId(user.id);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setFormError("");
    setModalOpen(true);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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

    if (editingId) {
      persist(users.map((user) => user.id === editingId ? { ...user, name: cleanName, email: cleanEmail, role } : user));
    } else {
      const newUser: AppUser = {
        id: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `user-${Date.now()}`,
        name: cleanName,
        email: cleanEmail,
        role,
        status: "Active",
        createdAt: new Date().toISOString().slice(0, 10),
      };
      persist([newUser, ...users]);
    }
    setModalOpen(false);
  }

  function toggleStatus(user: AppUser) {
    persist(users.map((item) => item.id === user.id ? { ...item, status: item.status === "Active" ? "Inactive" : "Active" } : item));
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Users</h1>
          <p className="mt-1 text-sm text-slate-400">Manage workspace users, roles, and account status.</p>
        </div>
        <button type="button" onClick={openCreate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200">
          <Plus size={17} /> Add User
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { label: "Total Users", value: users.length, icon: UserRound },
          { label: "Active Users", value: activeCount, icon: Check },
          { label: "Inactive Users", value: inactiveCount, icon: UserX },
        ].map((stat) => {
          const Icon = stat.icon;
          return <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">{stat.label}</p>
              <Icon size={19} className="text-slate-400" />
            </div>
            <p className="mt-3 text-2xl font-bold text-white">{stat.value}</p>
          </div>;
        })}
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        <div className="flex flex-col gap-3 border-b border-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="relative w-full sm:max-w-sm">
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, or role..." className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-slate-600" />
          </div>
          <select aria-label="Filter by user status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "All" | UserStatus)} className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-slate-600">
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        {filteredUsers.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-slate-950/60 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Joined</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-slate-800/30">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-slate-200">{initials(user.name)}</div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">{user.name}</p>
                          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500"><Mail size={12} />{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 px-2.5 py-1 text-xs text-slate-300"><Shield size={12} />{user.role}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${user.status === "Active" ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800 text-slate-400"}`}>{user.status}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">{user.createdAt}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={() => openEdit(user)} aria-label={`Edit ${user.name}`} className="rounded-lg border border-slate-700 p-2 text-slate-300 transition hover:bg-slate-800 hover:text-white"><Edit2 size={15} /></button>
                        <button type="button" onClick={() => toggleStatus(user)} className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white">{user.status === "Active" ? "Deactivate" : "Activate"}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <UserRound size={25} className="mx-auto text-slate-600" />
            <p className="mt-3 text-sm font-medium text-white">No users found</p>
            <p className="mt-1 text-sm text-slate-500">Try a different search or add a new user.</p>
          </div>
        )}
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setModalOpen(false); }}>
          <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-white">{editingId ? "Edit User" : "Add User"}</h2>
                <p className="mt-1 text-sm text-slate-500">Enter the user's basic account information.</p>
              </div>
              <button type="button" onClick={() => setModalOpen(false)} aria-label="Close dialog" className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-800 hover:text-white"><X size={19} /></button>
            </div>
            <div className="space-y-4 px-6 py-6">
              <div>
                <label htmlFor="user-name" className="mb-2 block text-sm font-medium text-slate-300">Full name</label>
                <input id="user-name" autoFocus required value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-slate-600" placeholder="e.g. Alex Morgan" />
              </div>
              <div>
                <label htmlFor="user-email" className="mb-2 block text-sm font-medium text-slate-300">Email</label>
                <input id="user-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-slate-600" placeholder="name@example.com" />
              </div>
              <div>
                <label htmlFor="user-role" className="mb-2 block text-sm font-medium text-slate-300">Role</label>
                <select id="user-role" value={role} onChange={(event) => setRole(event.target.value as UserRole)} className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-slate-600">
                  {roles.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </div>
              {formError && <p role="alert" className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">{formError}</p>}
            </div>
            <div className="flex flex-col-reverse gap-3 border-t border-slate-800 px-6 py-5 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white">Cancel</button>
              <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"><Check size={16} />{editingId ? "Save Changes" : "Create User"}</button>
            </div>
          </form>
        </div>
      )}
      <p className="text-xs text-slate-600">Prototype only: user data is stored in this browser. Authentication, invitations, and access enforcement require backend integration.</p>
    </div>
  );
}
