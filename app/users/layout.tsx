import type { ReactNode } from "react";
import PermissionGate from "@/components/access/PermissionGate";

export default function UsersLayout({ children }: { children: ReactNode }) {
  return <PermissionGate permission="users">{children}</PermissionGate>;
}
