import {
  CheckSquare,
  Mail,
  MessageSquare,
  Users,
} from "lucide-react";

import StatCard from "./StatCard";

const stats = [
  {
    title: "Tasks",
    value: 24,
    change: "+12%",
    changeType: "positive" as const,
    icon: CheckSquare,
  },
  {
    title: "Letters",
    value: 12,
    change: "+8%",
    changeType: "positive" as const,
    icon: Mail,
  },
  {
    title: "Messages",
    value: 8,
    change: "-3%",
    changeType: "negative" as const,
    icon: MessageSquare,
  },
  {
    title: "Users",
    value: 156,
    change: "+18%",
    changeType: "positive" as const,
    icon: Users,
  },
];

export default function StatsGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard
          key={stat.title}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          changeType={stat.changeType}
          icon={stat.icon}
        />
      ))}
    </div>
  );
}