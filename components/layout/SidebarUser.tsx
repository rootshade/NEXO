export default function SidebarUser() {
  return (
    <div className="border-t border-slate-800 p-4">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-white">
          M
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">
            Mohammad
          </p>

          <p className="truncate text-xs text-slate-400">
            User
          </p>
        </div>
      </div>
    </div>
  );
}