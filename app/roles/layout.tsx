import type { ReactNode } from "react";
import PermissionGate from "@/components/access/PermissionGate";

export default function RolesLayout({ children }: { children: ReactNode }) {
  return <PermissionGate permission="roles">{children}</PermissionGate>;
}
