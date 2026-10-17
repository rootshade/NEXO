export const CURRENT_USER_KEY = "nexo-current-user-id";
export const CURRENT_USER_EVENT = "nexo-current-user-updated";
export const USERS_KEY = "nexo-users";
export const PERMISSIONS_KEY = "nexo-permissions";
export const SUPER_ADMIN_ID = "user-mohammad";

export type AccessUser = { id: string; name: string; email: string; role: string; status: "Active" | "Inactive" };

const DEFAULT_USERS: AccessUser[] = [
  { id: SUPER_ADMIN_ID, name: "Mohammad", email: "mohammad@nexo.local", role: "Super Admin", status: "Active" },
  { id: "user-ali", name: "Ali", email: "ali@nexo.local", role: "User", status: "Active" },
  { id: "user-sara", name: "Sara", email: "sara@nexo.local", role: "Manager", status: "Active" },
];

const PERMISSION_BY_PATH: Record<string, string> = {
  "/": "dashboard", "/dashboard": "dashboard", "/tasks": "tasks.view",
  "/letters": "letters", "/messages": "messages", "/settings": "settings",
  "/users": "users", "/roles": "roles", "/permissions": "permissions",
};

export function getUsers(): AccessUser[] {
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    if (!raw) return DEFAULT_USERS;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_USERS;
    const users = parsed.filter((u): u is AccessUser => !!u && typeof u.id === "string" && typeof u.name === "string" && typeof u.role === "string" && (u.status === "Active" || u.status === "Inactive"));
    return users.length ? users : DEFAULT_USERS;
  } catch { return DEFAULT_USERS; }
}

export function getCurrentUser(): AccessUser {
  const users = getUsers();
  const id = window.localStorage.getItem(CURRENT_USER_KEY) || SUPER_ADMIN_ID;
  return users.find((user) => user.id === id && user.status === "Active") || users.find((user) => user.id === SUPER_ADMIN_ID) || users[0] || DEFAULT_USERS[0];
}

/** A task creator keeps visibility of tasks they created; the Super Admin is restricted to their own created tasks. */
export function canViewTask(
  task: { assignedTo: string; createdBy?: string },
  user: AccessUser
): boolean {
  const sameName = (left: string | undefined, right: string) =>
    (left ?? "").trim().toLowerCase() === right.trim().toLowerCase();

  if (user.role === "Super Admin") {
    return sameName(task.createdBy, user.name);
  }

  return sameName(task.assignedTo, user.name) || sameName(task.createdBy, user.name);
}

export function canAccess(user: AccessUser, permission: string): boolean {
  if (user.role === "Super Admin") return true;
  try {
    const raw: unknown = JSON.parse(window.localStorage.getItem(PERMISSIONS_KEY) || "null");
    if (raw && typeof raw === "object") {
      const rolePermissions = (raw as Record<string, unknown>)[user.role];
      if (rolePermissions && typeof rolePermissions === "object") {
        const value = (rolePermissions as Record<string, unknown>)[permission];
        if (typeof value === "boolean") return value;
      }
    }
  } catch { /* use defaults below */ }
  if (user.role === "Admin") return permission !== "permissions";
  if (user.role === "Manager") return ["dashboard", "tasks.view", "tasks.create", "tasks.edit", "letters", "messages", "settings"].includes(permission);
  if (user.role === "User") return ["dashboard", "tasks.view", "letters", "messages", "settings"].includes(permission);
  return false;
}

export function permissionForPath(pathname: string): string | null {
  if (PERMISSION_BY_PATH[pathname]) return PERMISSION_BY_PATH[pathname];
  if (pathname.startsWith("/tasks/")) return "tasks.view";
  if (pathname.startsWith("/letters/")) return "letters";
  if (pathname.startsWith("/messages/")) return "messages";
  return null;
}
