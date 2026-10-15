import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: number;
  icon: LucideIcon;
  description: string;
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: StatCardProps) {
  return (
    <div
      className="
        group
        rounded-2xl
        border border-slate-800
        bg-slate-900
        p-5
        transition-all
        duration-200
        hover:-translate-y-1
        hover:border-cyan-400/30
        hover:bg-cyan-400/10
      "
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-400">
          {title}
        </p>

        <div
          className="
            flex size-11
            items-center justify-center
            rounded-xl
            bg-slate-800
            text-slate-300
            transition-colors
            duration-200
            group-hover:bg-slate-700
            group-hover:text-white
          "
        >
          <Icon size={21} />
        </div>
      </div>

      <div className="mt-5">
        <p className="text-3xl font-bold tracking-tight text-white">
          {value}
        </p>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}
