"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Menu, Mail, MessageSquare, CheckSquare, Check, Trash2, Clock3, CheckCheck } from "lucide-react";
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
  timeLabel: string;
  createdAt: number;
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
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);
  const [dismissedNotificationIds, setDismissedNotificationIds] = useState<string[]>([]);
  const [notificationFilter, setNotificationFilter] = useState<"all" | "task" | "letter" | "message">("all");
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
    try {
      const savedRead = JSON.parse(localStorage.getItem("nexo-notification-read") || "[]");
      const savedDismissed = JSON.parse(localStorage.getItem("nexo-notification-dismissed") || "[]");
      if (Array.isArray(savedRead)) setReadNotificationIds(savedRead.filter((id): id is string => typeof id === "string"));
      if (Array.isArray(savedDismissed)) setDismissedNotificationIds(savedDismissed.filter((id): id is string => typeof id === "string"));
    } catch {
      // Ignore invalid notification preferences.
    }

    function syncNotifications() {
      const user = getCurrentUser();

      const letters = readStoredArray<{
        id: number;
        subject: string;
        sender: string;
        receiver: string;
        status: string;
        date?: string;
      }>("nexo-letters");

      const messages = readStoredArray<{
        id: number;
        subject: string;
        sender: string;
        receiver: string;
        status: string;
        date?: string;
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
            timeLabel: letter.date ? `Date: ${letter.date}` : "New",
            createdAt: letter.date && !Number.isNaN(Date.parse(letter.date)) ? Date.parse(letter.date) : Date.now(),
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
            timeLabel: message.date ? `Date: ${message.date}` : "New",
            createdAt: message.date && !Number.isNaN(Date.parse(message.date)) ? Date.parse(message.date) : Date.now(),
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
            timeLabel: task.createdAt ? `Created: ${new Date(task.createdAt).toLocaleDateString()}` : "Active task",
            createdAt: task.createdAt && !Number.isNaN(Date.parse(task.createdAt)) ? Date.parse(task.createdAt) : Date.now(),
          });
        });

      // Preserve previously discovered notifications so read items remain available in history.
      const savedHistory = readStoredArray<NotificationItem>("nexo-notification-history");
      const historyById = new Map<string, NotificationItem>();
      [...savedHistory, ...nextNotifications].forEach((item) => {
        if (!historyById.has(item.id)) historyById.set(item.id, item);
      });
      const mergedHistory = Array.from(historyById.values())
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 100);
      try {
        localStorage.setItem("nexo-notification-history", JSON.stringify(mergedHistory));
      } catch {
        // Keep notifications working if history storage is unavailable.
      }
      const savedDismissed = readStoredArray<string>("nexo-notification-dismissed");
      const savedRead = readStoredArray<string>("nexo-notification-read");
      setNotifications(mergedHistory.filter((item) => !savedDismissed.includes(item.id)));
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

  function markNotificationRead(id: string) {
    setReadNotificationIds((current) => {
      const next = current.includes(id) ? current : [...current, id];
      try { localStorage.setItem("nexo-notification-read", JSON.stringify(next)); } catch {
        // Keep the interface usable if browser storage is unavailable.
      }
      return next;
    });
  }

  function markAllNotificationsRead() {
    setReadNotificationIds((current) => {
      const next = Array.from(new Set([...current, ...notifications.map((item) => item.id)]));
      try { localStorage.setItem("nexo-notification-read", JSON.stringify(next)); } catch {
        // Keep the interface usable if browser storage is unavailable.
      }
      return next;
    });
  }

  function dismissNotification(id: string) {
    setDismissedNotificationIds((current) => {
      const next = current.includes(id) ? current : [...current, id];
      try { localStorage.setItem("nexo-notification-dismissed", JSON.stringify(next)); } catch {
        // Keep the interface usable if browser storage is unavailable.
      }
      return next;
    });
    setNotifications((current) => current.filter((item) => item.id !== id));
  }

  const notificationCount = notifications.filter((item) => !readNotificationIds.includes(item.id)).length;
  const visibleNotifications = notifications.filter(
    (item) => notificationFilter === "all" || item.type === notificationFilter
  );

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

        <div
          className={`pointer-events-none invisible absolute w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 opacity-0 shadow-2xl shadow-black/40 transition-all duration-200 group-hover:pointer-events-auto group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 ${
            notificationPosition && notificationPosition.x < window.innerWidth / 2
              ? "left-0"
              : "right-0"
          } ${
            notificationPosition && notificationPosition.y > window.innerHeight / 2
              ? "bottom-10"
              : "top-10"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-white">Notifications</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {notificationCount === 0
                  ? "You're all caught up."
                  : `${notificationCount} item${notificationCount === 1 ? "" : "s"} need your attention.`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {notificationCount > 0 && (
                <button type="button" onClick={markAllNotificationsRead} title="Mark all as read" aria-label="Mark all notifications as read" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-cyan-300">
                  <CheckCheck size={16} />
                </button>
              )}
              <Bell size={17} className="text-cyan-300" />
            </div>
          </div>

          <div className="flex gap-1 overflow-x-auto border-b border-slate-800 px-2 py-2">
            {([
              ["all", "All"],
              ["task", "Tasks"],
              ["letter", "Letters"],
              ["message", "Messages"],
            ] as const).map(([value, label]) => (
              <button key={value} type="button" onClick={() => setNotificationFilter(value)} className={`shrink-0 rounded-lg px-3 py-1.5 text-xs transition ${notificationFilter === value ? "bg-cyan-300/15 text-cyan-200" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}>
                {label}
              </button>
            ))}
          </div>

          <div className="max-h-[24rem] overflow-y-auto p-2">
            {visibleNotifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="mx-auto text-slate-600" size={28} />
                <p className="mt-3 text-sm font-medium text-slate-300">
                  {notifications.length === 0 ? "No notification history yet" : "No notifications in this filter"}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Letters, messages, and tasks you've received will appear here.
                </p>
              </div>
            ) : (
              visibleNotifications.map((notification) => {
                const Icon = iconByType[notification.type];

                return (
                  <div key={notification.id} className={`group/item flex gap-2 rounded-xl p-3 transition-colors hover:bg-slate-800 ${readNotificationIds.includes(notification.id) ? "opacity-60" : ""}`}>
                    <Link href={notification.href} onClick={() => markNotificationRead(notification.id)} className="flex min-w-0 flex-1 gap-3">
                      <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-300">
                        <Icon size={17} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">{notification.title}</p>
                          {!readNotificationIds.includes(notification.id) && <span className="size-1.5 shrink-0 rounded-full bg-cyan-300" />}
                        </div>
                        <p className="mt-1 truncate text-xs text-slate-400">{notification.description}</p>
                        <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500"><Clock3 size={11} />{notification.timeLabel}</p>
                      </div>
                    </Link>
                    <div className="flex shrink-0 flex-col gap-1">
                      <button type="button" onClick={() => markNotificationRead(notification.id)} title="Mark as read" aria-label="Mark notification as read" className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-700 hover:text-cyan-300"><Check size={14} /></button>
                      <button type="button" onClick={() => dismissNotification(notification.id)} title="Dismiss notification" aria-label="Dismiss notification" className="rounded-md p-1.5 text-slate-500 transition hover:bg-red-500/10 hover:text-red-300"><Trash2 size={14} /></button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
