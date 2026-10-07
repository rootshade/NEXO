import {
  CheckSquare,
  Mail,
  MessageSquare,
} from "lucide-react";

const actions = [
  {
    label: "Create Task",
    icon: CheckSquare,
  },
  {
    label: "Write Letter",
    icon: Mail,
  },
  {
    label: "New Message",
    icon: MessageSquare,
  },
];

export default function WelcomeSection() {
  return (
    <section
      className="
        rounded-2xl
        border border-slate-800
        bg-slate-900
        p-6
      "
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Welcome */}
        <div>
          <p className="text-sm font-medium text-slate-400">
            Welcome back
          </p>

          <h2 className="mt-1 text-2xl font-bold text-white">
            Good afternoon, Mohammad 👋
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Here’s what’s happening in your workspace today.
          </p>
        </div>
        
      </div>
    </section>
  );
}