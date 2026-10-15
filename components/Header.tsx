"use client";

import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";

type HeaderProps = {
  onMenuClick: () => void;
};

const pageTitles: Record<string, string> = {
  "/": "Home",
  "/dashboard": "Dashboard",
  "/tasks": "Tasks",
  "/letters": "Letters",
  "/messages": "Messages",
  "/settings": "Settings",
};

export default function Header({
  onMenuClick,
}: HeaderProps) {
  const pathname = usePathname();

  const title = pageTitles[pathname] ?? "Page";

  return (
    <header className="flex h-16 items-center border-b border-indigo-400/15 bg-slate-950/70 px-4 shadow-sm shadow-indigo-950/20 backdrop-blur-xl md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Open menu"
          className="
            flex size-10 items-center justify-center
            rounded-lg
            text-cyan-200
            transition-colors
            hover:bg-cyan-400/10
            hover:text-cyan-100
            md:hidden
          "
          onClick={onMenuClick}
        >
          <Menu size={22} />
        </button>

        <h1 className="text-xl font-semibold text-white">
          {title}
        </h1>
      </div>
    </header>
  );
}