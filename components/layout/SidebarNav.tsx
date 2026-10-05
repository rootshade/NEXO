"use client";

import SidebarNavItem from "./SidebarNavItem";
import { sidebarItems } from "./sidebar/sidebarData";

type SidebarNavProps = {
  onNavigate: () => void;
};

export default function SidebarNav({
  onNavigate,
}: SidebarNavProps) {
  return (
    <nav className="space-y-1 px-3">
      {sidebarItems.map((item) => (
        <SidebarNavItem
          key={item.label}
          label={item.label}
          icon={item.icon}
          href={item.href}
          onClick={onNavigate}
        />
      ))}
    </nav>
  );
}