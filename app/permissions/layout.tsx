import type { ReactNode } from "react";
import PermissionGate from "@/components/access/PermissionGate";

export default function PermissionsLayout({ children }: { children: ReactNode }) {
  return <PermissionGate permission="permissions">{children}</PermissionGate>;
}
