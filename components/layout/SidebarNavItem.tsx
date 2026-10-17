"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

type SidebarNavItemProps = {
  label: string;
  icon: LucideIcon;
  href: string;
  onClick: () => void;
  badge?: number;
};

export default function SidebarNavItem({ label, icon: Icon, href, onClick, badge = 0 }: SidebarNavItemProps) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  return (
    <Link href={href} onClick={onClick} className={`flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${active ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-900 hover:text-white"}`}>
      <Icon size={20} />
      <span className="min-w-0 flex-1">{label}</span>
      {badge > 0 && <span aria-label={`${badge} unread`} className="inline-flex min-w-5 items-center justify-center rounded-full bg-cyan-300 px-1.5 py-0.5 text-[10px] font-bold leading-none text-slate-950">{badge > 99 ? "99+" : badge}</span>}
    </Link>
  );
}
