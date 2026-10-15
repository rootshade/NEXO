
import Link from "next/link";
import {
  Plus,
  PenLine,
  MessageSquare,
} from "lucide-react";

const actions = [
  {
    title: "Create Task",
    description: "Create and assign a new task",
    href: "/tasks",
    icon: Plus,
  },
  {
    title: "Write Letter",
    description: "Create and send a new letter",
    href: "/letters",
    icon: PenLine,
  },
  {
    title: "New Message",
    description: "Start a new conversation",
    href: "/messages",
    icon: MessageSquare,
  },
];

export default function QuickActions() {
  return (
    <section>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="
                group rounded-2xl
                border border-slate-800
                bg-slate-900
                p-5
                transition-all
                duration-200
                hover:border-cyan-400/30
                hover:bg-cyan-400/10/80
              "
            >
              <div className="flex items-start gap-4">
                <div
                  className="
                    flex h-11 w-11 shrink-0
                    items-center justify-center
                    rounded-xl
                    bg-slate-800
                    text-slate-300
                    transition-colors
                    group-hover:bg-slate-700
                    group-hover:text-white
                  "
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <h3 className="font-medium text-white">
                    {action.title}
                  </h3>

                  <p className="mt-1 text-sm leading-5 text-slate-400">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
