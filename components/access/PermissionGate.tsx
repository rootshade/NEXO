"use client";

import { useEffect, useState, type ReactNode } from "react";
import { canAccess, getCurrentUser } from "@/data/accessControl";

type PermissionGateProps = {
  permission: string;
  children: ReactNode;
};

export default function PermissionGate({ permission, children }: PermissionGateProps) {
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    const refresh = () => setAllowed(canAccess(getCurrentUser(), permission));
    const timer = window.setTimeout(refresh, 0);
    const events = [
      "storage",
      "nexo-current-user-updated",
      "nexo-permissions-updated",
      "nexo-users-updated",
    ];

    events.forEach((eventName) => window.addEventListener(eventName, refresh));

    return () => {
      window.clearTimeout(timer);
      events.forEach((eventName) => window.removeEventListener(eventName, refresh));
    };
  }, [permission]);

  if (allowed === null) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center" aria-live="polite">
        <p className="text-sm text-slate-400">Checking access…</p>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl border border-rose-400/20 bg-rose-400/10 text-rose-300">
            <span className="text-xl" aria-hidden="true">🔒</span>
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-white">Access Denied</h1>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Your current role does not have permission to access this page. Contact an administrator if you think this is a mistake.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
