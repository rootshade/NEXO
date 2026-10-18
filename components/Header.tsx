"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Menu, Mail, MessageSquare, CheckSquare } from "lucide-react";
import { usePathname } from "next/navigation";

import {
  CURRENT_USER_EVENT,
  canViewTask,
  getCurrentUser,
  isCorrespondenceRecipient,
} from "@/data/accessControl";
import { loadTasks, TASKS_UPDATED_EVENT } from "@/data/taskStore";

type HeaderProps = {
  onMenuClick: () => void;
};

type NotificationItem = {
  id: string;
  type: "letter" | "message" | "task";
  title: string;
  description: string;
  href: string;
};

const pageTitles: Record<string, string> = {
  "/": "Home",
  "/dashboard": "Dashboard",
  "/tasks": "Tasks",
  "/letters": "Letters",
  "/messages": "Messages",
  "/settings": "Settings",
  "/users": "Users",
  "/roles": "Roles",
  "/permissions": "Permissions",
};

function readStoredArray<T>(key: string): T[] {
  if (typeof window === "undefined") return [];

  try {
    const value = localStorage.getItem(key);
    if (!value) return [];
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export default function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Page";

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notificationPosition, setNotificationPosition] = useState<{ x: number; y: number } | null>(null);
  const notificationWrapperRef = useRef<HTMLDivElement>(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const defaultPosition = {
      x: Math.max(8, window.innerWidth - 56),
      y: 72,
    };

    try {
      const stored = localStorage.getItem("nexo-notification-position");
      if (stored) {
        const parsed = JSON.parse(stored) as { x?: number; y?: number };
        if (typeof parsed.x === "number" && typeof parsed.y === "number") {
          setNotificationPosition({
            x: Math.min(Math.max(8, parsed.x), Math.max(8, window.innerWidth - 48)),
            y: Math.min(Math.max(8, parsed.y), Math.max(8, window.innerHeight - 48)),
          });
          return;
        }
      }
    } catch {
      // Ignore invalid saved positions and use the default position.
    }

    setNotificationPosition(defaultPosition);
  }, []);

  function handleNotificationDragStart(event: React.PointerEvent<HTMLButtonElement>) {
    if (!notificationWrapperRef.current) return;
    const rect = notificationWrapperRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleNotificationDrag(event: React.PointerEvent<HTMLButtonElement>) {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;

    const x = Math.min(
      Math.max(8, event.clientX - dragOffsetRef.current.x),
      Math.max(8, window.innerWidth - 48)
    );
    const y = Math.min(
      Math.max(8, event.clientY - dragOffsetRef.current.y),
      Math.max(8, window.innerHeight - 48)
    );

    setNotificationPosition({ x, y });
  }

  function handleNotificationDragEnd(event: React.PointerEvent<HTMLButtonElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (notificationPosition) {
      try {
        localStorage.setItem("nexo-notification-position", JSON.stringify(notificationPosition));
      } catch {
        // The floating button still works if browser storage is unavailable.
      }
    }
  }

  useEffect(() => {
    function syncNotifications() {
      const user = getCurrentUser();

      const letters = readStoredArray<{
        id: number;
        subject: string;
        sender: string;
        receiver: string;
        status: string;
      }>("nexo-letters");

      const messages = readStoredArray<{
        id: number;
        subject: string;
        sender: string;
        receiver: string;
        status: string;
      }>("nexo-messages");

      const nextNotifications: NotificationItem[] = [];

      letters
        .filter(
          (letter) =>
            letter.status === "Unread" &&
            isCorrespondenceRecipient(letter.receiver, user)
        )
        .slice(0, 10)
        .forEach((letter) => {
          nextNotifications.push({
            id: `letter-${letter.id}`,
            type: "letter",
            title: "New letter",
            description: `${letter.sender}: ${letter.subject}`,
            href: `/letters/${letter.id}`,
          });
        });

      messages
        .filter(
          (message) =>
            message.status === "Unread" &&
            isCorrespondenceRecipient(message.receiver, user)
        )
        .slice(0, 10)
        .forEach((message) => {
          nextNotifications.push({
            id: `message-${message.id}`,
            type: "message",
            title: "New message",
            description: `${message.sender}: ${message.subject}`,
            href: `/messages/${message.id}`,
          });
        });

      loadTasks()
        .filter(
          (task) =>
            canViewTask(task, user) &&
            task.assignedTo === user.name &&
            task.status !== "Completed"
        )
        .slice(0, 10)
        .forEach((task) => {
          nextNotifications.push({
            id: `task-${task.id}`,
            type: "task",
            title: "Task assigned",
            description: `${task.title} · ${task.status}`,
            href: `/tasks/${task.id}`,
          });
        });

      setNotifications(nextNotifications.slice(0, 20));
    }

    syncNotifications();

    const events = [
      CURRENT_USER_EVENT,
      TASKS_UPDATED_EVENT,
      "nexo-letters-updated",
      "nexo-messages-updated",
      "nexo-permissions-updated",
      "storage",
    ];

    events.forEach((eventName) =>
      window.addEventListener(eventName, syncNotifications)
    );

    return () => {
      events.forEach((eventName) =>
        window.removeEventListener(eventName, syncNotifications)
      );
    };
  }, []);

  const notificationCount = notifications.length;

  const iconByType = useMemo(
    () => ({
      letter: Mail,
      message: MessageSquare,
      task: CheckSquare,
    }),
    []
  );

  return (
    <>
      <header className="relative flex h-16 items-center border-b border-indigo-400/15 bg-slate-950/70 px-4 shadow-sm shadow-indigo-950/20 backdrop-blur-xl md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Open menu"
            className="flex size-10 items-center justify-center rounded-lg text-cyan-200 transition-colors hover:bg-cyan-400/10 hover:text-cyan-100 md:hidden"
            onClick={onMenuClick}
          >
            <Menu size={22} />
          </button>

          <h1 className="text-xl font-semibold text-white">{title}</h1>
        </div>
      </header>

      <div
        ref={notificationWrapperRef}
        className="group fixed z-50"
        style={notificationPosition ? { left: notificationPosition.x, top: notificationPosition.y } : undefined}
      >
        <button
          type="button"
          aria-label="Notifications — drag to move"
          title="Drag to move notifications"
          onPointerDown={handleNotificationDragStart}
          onPointerMove={handleNotificationDrag}
          onPointerUp={handleNotificationDragEnd}
          onPointerCancel={handleNotificationDragEnd}
          className="relative flex size-10 touch-none cursor-grab items-center justify-center rounded-xl border border-slate-700/80 bg-slate-900/90 text-slate-400 shadow-lg shadow-black/20 backdrop-blur-md transition-colors duration-200 hover:border-cyan-400/40 hover:bg-slate-800 hover:text-cyan-200 active:cursor-grabbing"
        >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-cyan-300 px-1 text-[10px] font-bold leading-4 text-slate-950">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </button>

        <div className="pointer-events-none invisible absolute right-0 top-12 w-[min(24rem,calc(100vw-2rem))] translate-y-1 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 opacity-0 shadow-2xl shadow-black/40 transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Notifications</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {notificationCount === 0
                  ? "You're all caught up."
                  : `${notificationCount} item${notificationCount === 1 ? "" : "s"} need your attention.`}
              </p>
            </div>
            <Bell size={17} className="text-cyan-300" />
          </div>

          <div className="max-h-[24rem] overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="mx-auto text-slate-600" size={28} />
                <p className="mt-3 text-sm font-medium text-slate-300">
                  No new notifications
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  New letters, messages, and active tasks will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const Icon = iconByType[notification.type];

                return (
                  <Link
                    key={notification.id}
                    href={notification.href}
                    className="flex gap-3 rounded-xl p-3 transition-colors hover:bg-slate-800"
                  >
                    <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-300">
                      <Icon size={17} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">
                        {notification.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-slate-400">
                        {notification.description}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
