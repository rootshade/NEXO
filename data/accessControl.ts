export const CURRENT_USER_KEY = "nexo-current-user-id";
export const CURRENT_USER_EVENT = "nexo-current-user-updated";
export const USERS_KEY = "nexo-users";
export const PERMISSIONS_KEY = "nexo-permissions";
export const SUPER_ADMIN_ID = "user-mohammad";

import { hasRolePermission } from "@/data/permissionPolicy.cjs";
import { isTaskCreatedBy } from "@/data/taskOwnership.cjs";

export type AccessUser = { id: string; name: string; email: string; role: string; status: "Active" | "Inactive" };

const DEFAULT_USERS: AccessUser[] = [
  { id: SUPER_ADMIN_ID, name: "Mohammad", email: "mohammad@nexo.local", role: "Super Admin", status: "Active" },
  { id: "user-ali", name: "Ali", email: "ali@nexo.local", role: "User", status: "Active" },
  { id: "user-sara", name: "Sara", email: "sara@nexo.local", role: "Manager", status: "Active" },
];

const PERMISSION_BY_PATH: Record<string, string> = {
  "/": "dashboard",
  "/dashboard": "dashboard",
  "/tasks": "tasks.view",
  "/letters": "letters.view",
  "/messages": "messages.view",
  "/settings": "settings",
  "/users": "users",
  "/roles": "roles",
  "/permissions": "permissions",
};

export function getUsers(): AccessUser[] {
  if (typeof window === "undefined") return DEFAULT_USERS;

  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    if (!raw) return DEFAULT_USERS;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_USERS;
    const users = parsed.filter((u): u is AccessUser => !!u && typeof u.id === "string" && typeof u.name === "string" && typeof u.role === "string" && (u.status === "Active" || u.status === "Inactive"));
    return users.length ? users : DEFAULT_USERS;
  } catch {
    return DEFAULT_USERS;
  }
}

export function getCurrentUser(): AccessUser {
  const users = getUsers();

  if (typeof window === "undefined") {
    return users.find((user) => user.id === SUPER_ADMIN_ID) || DEFAULT_USERS[0];
  }

  const storedId = window.localStorage.getItem(CURRENT_USER_KEY);

  // Use the selected account even when inactive so access checks can deny it.
  // Never silently replace a disabled/deleted account with the Super Admin.
  if (!storedId) {
    return users.find((user) => user.id === SUPER_ADMIN_ID) || DEFAULT_USERS[0];
  }

  return users.find((user) => user.id === storedId) || {
    id: storedId,
    name: "Unavailable account",
    email: "",
    role: "User",
    status: "Inactive",
  };
}

/** A task creator keeps visibility of tasks they created; the Super Admin is restricted to their own created tasks. */
export function canViewTask(
  task: { assignedTo: string; createdBy?: string; createdById?: string },
  user: AccessUser
): boolean {
  if (!canAccess(user, "tasks.view")) return false;

  const sameName = (left: string | undefined, right: string) =>
    (left ?? "").trim().toLowerCase() === right.trim().toLowerCase();

  const hasStableCreatorId = typeof task.createdById === "string" && task.createdById.length > 0;
  const isCreator = hasStableCreatorId
    ? isTaskCreatedBy(task, user)
    : sameName(task.createdBy, user.name);

  if (user.role === "Super Admin") {
    return isCreator;
  }

  return sameName(task.assignedTo, user.name) || isCreator;
}

/** Match correspondence participant labels to a user's display name, including legacy labels such as "Ali Ahmadi" for "Ali". */
function matchesCorrespondenceName(participant: string, userName: string): boolean {
  const person = participant.trim().toLowerCase();
  const name = userName.trim().toLowerCase();
  return person === name || person.startsWith(`${name} `) || name.startsWith(`${person} `);
}

export function canViewCorrespondence(
  sender: string,
  receiver: string,
  user: AccessUser
): boolean {
  if (user.status !== "Active") return false;
  return matchesCorrespondenceName(sender, user.name) || matchesCorrespondenceName(receiver, user.name);
}

/** Only the addressed recipient can mark a correspondence item as read. */
export function isCorrespondenceRecipient(receiver: string, user: AccessUser): boolean {
  if (user.status !== "Active") return false;
  return matchesCorrespondenceName(receiver, user.name);
}

export function canAccess(user: AccessUser, permission: string): boolean {
  // Account status must be checked before role privileges.
  if (user.status !== "Active") return false;
  if (user.role === "Super Admin") return true;

  let overrides: unknown = null;

  if (typeof window !== "undefined") {
    try {
      overrides = JSON.parse(window.localStorage.getItem(PERMISSIONS_KEY) || "null");
    } catch {
      // Invalid browser data falls back to built-in defaults.
    }
  }

  return hasRolePermission(user.role, permission, overrides);
}

export function permissionForPath(pathname: string): string | null {
  if (PERMISSION_BY_PATH[pathname]) return PERMISSION_BY_PATH[pathname];
  if (pathname.startsWith("/tasks/")) return "tasks.view";
  if (pathname.startsWith("/letters/")) return "letters.view";
  if (pathname.startsWith("/messages/")) return "messages.view";
  return null;
}
