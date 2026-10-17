"use client";

import { useEffect, useState } from "react";
import SidebarNavItem from "./SidebarNavItem";
import { sidebarItems } from "./sidebar/sidebarData";
import { canAccess, CURRENT_USER_EVENT, getCurrentUser } from "@/data/accessControl";

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

  useEffect(() => {
    const refresh = () => setRevision((value) => value + 1);
    window.addEventListener("storage", refresh);
    window.addEventListener(CURRENT_USER_EVENT, refresh);
    window.addEventListener("nexo-permissions-updated", refresh);
    window.addEventListener("nexo-users-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(CURRENT_USER_EVENT, refresh);
      window.removeEventListener("nexo-permissions-updated", refresh);
      window.removeEventListener("nexo-users-updated", refresh);
    };
  }, []);

  void revision;
  const user = getCurrentUser();
  const visibleItems = sidebarItems.filter((item) => canAccess(user, permissionByHref[item.href] ?? ""));

  return (
    <nav className="space-y-1 px-3">
      {visibleItems.map((item) => (
        <SidebarNavItem key={item.label} label={item.label} icon={item.icon} href={item.href} onClick={onNavigate} />
      ))}
    </nav>
  );
}
