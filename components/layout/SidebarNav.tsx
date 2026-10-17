"use client";

import { useEffect, useState } from "react";
import SidebarNavItem from "./SidebarNavItem";
import { sidebarItems } from "./sidebar/sidebarData";
import {
  canAccess,
  CURRENT_USER_EVENT,
  getCurrentUser,
  isCorrespondenceRecipient,
  type AccessUser,
} from "@/data/accessControl";

type UnreadCounts = { letters: number; messages: number };

function readUnreadCounts(user: AccessUser): UnreadCounts {
  try {
    const rawLetters = window.localStorage.getItem("nexo-letters");
    const rawMessages = window.localStorage.getItem("nexo-messages");
    const letters: unknown = rawLetters ? JSON.parse(rawLetters) : [];
    const messages: unknown = rawMessages ? JSON.parse(rawMessages) : [];

    return {
      letters: Array.isArray(letters)
        ? letters.filter((item) => item && typeof item.receiver === "string" && item.status === "Unread" && isCorrespondenceRecipient(item.receiver, user)).length
        : 0,
      messages: Array.isArray(messages)
        ? messages.filter((item) => item && typeof item.receiver === "string" && item.status === "Unread" && isCorrespondenceRecipient(item.receiver, user)).length
        : 0,
    };
  } catch {
    return { letters: 0, messages: 0 };
  }
}

const permissionByHref: Record<string, string> = {
  "/dashboard": "dashboard",
  "/tasks": "tasks.view",
  "/letters": "letters.view",
  "/messages": "messages.view",
  "/users": "users",
  "/roles": "roles",
  "/permissions": "permissions",
  "/settings": "settings",
};

type SidebarNavProps = { onNavigate: () => void };

export default function SidebarNav({ onNavigate }: SidebarNavProps) {
  const [revision, setRevision] = useState(0);
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({ letters: 0, messages: 0 });
  const [user, setUser] = useState<AccessUser | null>(null);

  useEffect(() => {
    const refresh = () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      setUnreadCounts(readUnreadCounts(currentUser));
      setRevision((value) => value + 1);
    };

    refresh();
    const events = [
      "storage",
      CURRENT_USER_EVENT,
      "nexo-permissions-updated",
      "nexo-users-updated",
      "nexo-letters-updated",
      "nexo-messages-updated",
    ];
    events.forEach((eventName) => window.addEventListener(eventName, refresh));
    return () => events.forEach((eventName) => window.removeEventListener(eventName, refresh));
  }, []);

  void revision;
  if (!user) return null;

  const visibleItems = sidebarItems.filter((item) => canAccess(user, permissionByHref[item.href] ?? ""));

  return (
    <nav className="space-y-1 px-3">
      {visibleItems.map((item) => (
        <SidebarNavItem
          key={item.label}
          label={item.label}
          icon={item.icon}
          href={item.href}
          onClick={onNavigate}
          badge={item.href === "/letters" ? unreadCounts.letters : item.href === "/messages" ? unreadCounts.messages : 0}
        />
      ))}
    </nav>
  );
}
