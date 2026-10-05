"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

type SidebarNavItemProps = {
  label: string;
  icon: LucideIcon;
  href: string;
  onClick: () => void;
};

export default function SidebarNavItem({
  label,
  icon: Icon,
  href,
  onClick,
}: SidebarNavItemProps) {
  const pathname = usePathname();

  const active = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        flex cursor-pointer items-center gap-3
        rounded-lg px-4 py-3 text-sm
        transition-colors
        ${
          active
            ? "bg-slate-800 text-white"
            : "text-slate-400 hover:bg-slate-900 hover:text-white"
        }
      `}
    >
      <Icon size={20} />

      <span>{label}</span>
    </Link>
  );
}