import Link from "next/link";
import { ArrowRight, LayoutDashboard, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-indigo-400/20 bg-gradient-to-br from-indigo-950/70 via-slate-900 to-cyan-950/50 p-8 shadow-2xl shadow-indigo-950/20 sm:p-12">
      <div className="pointer-events-none absolute -right-10 -top-12 size-64 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-200"><Sparkles size={14} /> NEXO WORKSPACE</span>
        <h1 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-5xl">Everything your team needs, <span className="bg-gradient-to-r from-cyan-200 via-sky-300 to-indigo-300 bg-clip-text text-transparent">in one place.</span></h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">Organize tasks, manage letters, and keep team communication moving with NEXO.</p>
        <Link href="/dashboard" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-cyan-200"><LayoutDashboard size={17} /> Open Dashboard <ArrowRight size={16} /></Link>
      </div>
    </section>
  );
}
