import {
  LayoutDashboard,
  CheckSquare,
  Mail,
  MessageSquare,
  Users,
  Settings,
  ShieldCheck,
  LockKeyhole,
} from "lucide-react";

export const sidebarItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    label: "Tasks",
    icon: CheckSquare,
    href: "/tasks",
  },
  {
    label: "Letters",
    icon: Mail,
    href: "/letters",
  },
  {
    label: "Messages",
    icon: MessageSquare,
    href: "/messages",
  },
  {
    label: "Users",
    icon: Users,
    href: "/users",
  },
  {
    label: "Roles",
    icon: ShieldCheck,
    href: "/roles",
  },
  {
    label: "Permissions",
    icon: LockKeyhole,
    href: "/permissions",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
];