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
    <header className="flex h-16 items-center justify-between border-b border-slate-800 px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Open menu"
          className="
            flex size-10 items-center justify-center
            rounded-lg
            text-slate-300
            transition-colors
            hover:bg-slate-800
            hover:text-white
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

      <div className="flex items-center gap-3">
        <div className="flex size-9 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-white">
          M
        </div>

        <span className="hidden text-sm text-slate-300 sm:block">
          Mohammad
        </span>
      </div>
    </header>
  );
}