import { X } from "lucide-react";

import SidebarNav from "./SidebarNav";
import SidebarUser from "./SidebarUser";

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({
  open,
  onClose,
}: SidebarProps) {
  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-screen w-64 flex-col
          bg-slate-950 text-white
          transition-transform duration-300
          md:static md:translate-x-0
          ${
            open
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Logo */}
<div className="flex items-center justify-between p-6">
  <h1 className="text-2xl font-bold">
    NEXO
  </h1>

  <button
    type="button"
    aria-label="Close sidebar"
    className="
      flex size-9 items-center justify-center
      rounded-lg
      text-slate-400
      transition-colors
      hover:bg-slate-800
      hover:text-white
      md:hidden
    "
    onClick={onClose}
  >
    <X size={20} />
  </button>
</div>
     {/* Navigation */}
<div className="min-h-0 flex-1 overflow-y-auto">
  <SidebarNav onNavigate={onClose} />
</div>

{/* User */}
<div className="shrink-0">
  <SidebarUser />
</div>
      </aside>
    </>
  );
}