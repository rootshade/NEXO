import {
  LayoutDashboard,
  CheckSquare,
  Mail,
  MessageSquare,
  Settings,
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
    label: "Settings",
    icon: Settings,
    href: "/settings",
  },
]