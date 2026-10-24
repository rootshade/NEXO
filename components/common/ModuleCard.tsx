import type { ReactNode } from "react";

type ModuleCardProps = {
  children: ReactNode;
  className?: string;
};

export default function ModuleCard({
  children,
  className = "",
}: ModuleCardProps) {
  return (
    <section
      className={`group rounded-2xl border border-indigo-400/15
        bg-gradient-to-br from-slate-900 via-slate-900
        to-indigo-950/20 p-5 shadow-xl shadow-black/10
        transition duration-200 hover:border-cyan-400/30
        hover:to-cyan-950/20 ${className}`}
    >
      {children}
    </section>
  );
}
