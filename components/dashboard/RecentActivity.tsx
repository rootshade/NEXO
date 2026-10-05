import {
  CheckCircle2,
  FileText,
  ListTodo,
  UserPlus,
} from "lucide-react";

type Activity = {
  id: number;
  title: string;
  description: string;
  time: string;
  icon: "task" | "letter" | "user" | "completed";
};

const activities: Activity[] = [
  {
    id: 1,
    title: "New task created",
    description: "Design login page",
    time: "5 minutes ago",
    icon: "task",
  },
  {
    id: 2,
    title: "New letter received",
    description: "You received a new letter",
    time: "18 minutes ago",
    icon: "letter",
  },
  {
    id: 3,
    title: "Task completed",
    description: "Configure user permissions",
    time: "42 minutes ago",
    icon: "completed",
  },
  {
    id: 4,
    title: "New user added",
    description: "A new user joined the workspace",
    time: "1 hour ago",
    icon: "user",
  },
];

const activityIcons = {
  task: ListTodo,
  letter: FileText,
  user: UserPlus,
  completed: CheckCircle2,
};

export default function RecentActivity() {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-800 px-5 py-4">
        <h2 className="text-lg font-semibold text-white">
          Recent Activity
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Latest activity in your workspace
        </p>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-slate-800">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.icon];

          return (
            <div
              key={activity.id}
              className="
                flex items-start gap-4
                px-5 py-4
                transition-colors
                hover:bg-slate-800/50
              "
            >
              {/* Icon */}
              <div
                className="
                  flex size-10 shrink-0
                  items-center justify-center
                  rounded-xl
                  bg-slate-800
                  text-slate-300
                "
              >
                <Icon size={18} />
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">
                  {activity.title}
                </p>

                <p className="mt-1 truncate text-sm text-slate-400">
                  {activity.description}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  {activity.time}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}