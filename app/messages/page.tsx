"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Mail, MailOpen, MessageSquare, Plus, Search, Send, X } from "lucide-react";
import { canAccess, canViewCorrespondence, getCurrentUser, getUsers, CURRENT_USER_EVENT, type AccessUser } from "@/data/accessControl";

import {
  initialMessages,
  type Message,
} from "@/data/messages";

type MessageFilter = "All" | "Unread" | "Read" | "Sent";

const filters: MessageFilter[] = [
  "All",
  "Unread",
  "Read",
  "Sent",
];

export default function MessagesPage() {
  const [messages, setMessages] =
    useState<Message[]>(initialMessages);

  const [isLoaded, setIsLoaded] = useState(false);
  const [canViewMessages, setCanViewMessages] = useState(false);
  const [canCreateMessages, setCanCreateMessages] = useState(false);
  const [currentUser, setCurrentUser] = useState<AccessUser | null>(null);
  const [availableRecipients, setAvailableRecipients] = useState<AccessUser[]>([]);

  const [activeFilter, setActiveFilter] =
    useState<MessageFilter>("All");

  const [search, setSearch] = useState("");

  const [showNewMessage, setShowNewMessage] =
    useState(false);

  const [receiver, setReceiver] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    function syncMessagePermissions() {
      const user = getCurrentUser();
      setCurrentUser(user);
      setAvailableRecipients(getUsers().filter((candidate) => candidate.status === "Active" && candidate.id !== user.id));
      setCanViewMessages(canAccess(user, "messages.view"));
      setCanCreateMessages(canAccess(user, "messages.create"));
    }
    syncMessagePermissions();
    window.addEventListener(CURRENT_USER_EVENT, syncMessagePermissions);
    window.addEventListener("nexo-permissions-updated", syncMessagePermissions);
    window.addEventListener("nexo-users-updated", syncMessagePermissions);
    window.addEventListener("storage", syncMessagePermissions);
    return () => {
      window.removeEventListener(CURRENT_USER_EVENT, syncMessagePermissions);
      window.removeEventListener("nexo-permissions-updated", syncMessagePermissions);
      window.removeEventListener("nexo-users-updated", syncMessagePermissions);
      window.removeEventListener("storage", syncMessagePermissions);
    };
  }, []);

  // Load messages from localStorage after the initial render
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedMessages =
        localStorage.getItem("nexo-messages");

      if (savedMessages) {
        try {
          const parsedMessages: unknown = JSON.parse(savedMessages);

          if (Array.isArray(parsedMessages)) {
            setMessages(parsedMessages as Message[]);
          } else {
            localStorage.removeItem("nexo-messages");
          }
        } catch {
          localStorage.removeItem("nexo-messages");
        }
      }

      setIsLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // Keep the list in sync when a message is opened or marked as read.
  useEffect(() => {
    function handleMessagesUpdated() {
      window.setTimeout(() => {
        const savedMessages = localStorage.getItem("nexo-messages");

        if (!savedMessages) return;

        try {
          const parsedMessages: unknown = JSON.parse(savedMessages);

          if (Array.isArray(parsedMessages)) {
            setMessages(parsedMessages as Message[]);
          } else {
            localStorage.removeItem("nexo-messages");
          }
        } catch {
          localStorage.removeItem("nexo-messages");
        }
      }, 0);
    }

    window.addEventListener("nexo-messages-updated", handleMessagesUpdated);

    return () => {
      window.removeEventListener("nexo-messages-updated", handleMessagesUpdated);
    };
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem(
      "nexo-messages",
      JSON.stringify(messages)
    );
  }, [messages, isLoaded]);

  // Filter messages
  const filteredMessages = useMemo(() => {
    const userMessages = currentUser
      ? messages.filter((message) => canViewCorrespondence(message.sender, message.receiver, currentUser))
      : [];

    return userMessages.filter((message) => {
      const isSender = currentUser?.name === message.sender;
      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "Sent" && isSender) ||
        (activeFilter === "Unread" && !isSender && message.status === "Unread") ||
        (activeFilter === "Read" && !isSender && message.status === "Read");

      const searchValue = search.toLowerCase();

      const matchesSearch =
        message.subject
          .toLowerCase()
          .includes(searchValue) ||
        message.sender
          .toLowerCase()
          .includes(searchValue) ||
        message.receiver
          .toLowerCase()
          .includes(searchValue) ||
        message.content
          .toLowerCase()
          .includes(searchValue);

      return matchesFilter && matchesSearch;
    });
  }, [messages, activeFilter, search, currentUser]);

  // Create new message
  function handleSendMessage() {
    if (!canAccess(getCurrentUser(), "messages.create")) {
      setCanCreateMessages(false);
      return;
    }
    const selectedRecipient = availableRecipients.find((candidate) => candidate.name === receiver);
    if (!selectedRecipient || !subject.trim() || !content.trim()) {
      return;
    }

    const newMessage: Message = {
      id: Date.now(),
      sender: getCurrentUser().name,
      receiver: selectedRecipient.name,
      subject: subject.trim(),
      content: content.trim(),
      date: new Date()
        .toISOString()
        .slice(0, 16)
        .replace("T", " "),
      status: "Unread",
    };

    setMessages((currentMessages) => [
      newMessage,
      ...currentMessages,
    ]);

    handleCloseModal();
  }

  // Close modal and reset form
  function handleCloseModal() {
    setShowNewMessage(false);
    setReceiver("");
    setSubject("");
    setContent("");
  }

  if (!canViewMessages) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-slate-900 p-8 text-center">
        <h1 className="text-xl font-semibold text-white">Access Denied</h1>
        <p className="mt-2 text-sm text-slate-400">You do not have permission to view messages.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Page hero */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-400/20 bg-gradient-to-r from-indigo-950 via-slate-900 to-cyan-950 p-6 shadow-xl shadow-indigo-950/20 sm:p-7">
        <div className="pointer-events-none absolute -right-8 -top-12 size-48 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold text-cyan-200">NEXO WORKSPACE</div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Messages
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Manage your internal messages.
          </p>
        </div>

        {canCreateMessages && <button
          type="button"
          onClick={() => setShowNewMessage(true)}
          className="
            flex items-center justify-center gap-2
            rounded-xl
            bg-cyan-300
            px-4 py-2.5
            text-sm font-semibold
            text-slate-950
            transition-colors
            hover:bg-cyan-200
          "
        >
          <Plus size={18} />
          New Message
        </button>}
        </div>
      </div>

      {/* Message statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Messages", value: currentUser ? messages.filter((message) => canViewCorrespondence(message.sender, message.receiver, currentUser)).length : 0, icon: MessageSquare, color: "text-indigo-300", tile: "bg-indigo-400/10", border: "border-indigo-400/20" },
          { label: "Unread Messages", value: currentUser ? messages.filter((message) => message.receiver === currentUser.name && message.status === "Unread").length : 0, icon: MailOpen, color: "text-amber-300", tile: "bg-amber-400/10", border: "border-amber-400/20" },
          { label: "Read Messages", value: currentUser ? messages.filter((message) => message.receiver === currentUser.name && message.status === "Read").length : 0, icon: CheckCircle2, color: "text-emerald-300", tile: "bg-emerald-400/10", border: "border-emerald-400/20" },
          { label: "Sent by Me", value: currentUser ? messages.filter((message) => message.sender === currentUser.name).length : 0, icon: Send, color: "text-cyan-300", tile: "bg-cyan-400/10", border: "border-cyan-400/20" },
        ].map((stat) => {
          const Icon = stat.icon;
          return <div key={stat.label} className={`rounded-2xl border ${stat.border} bg-slate-900 p-5 transition hover:-translate-y-0.5 hover:bg-slate-800/80`}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-slate-400">{stat.label}</p>
              <div className={`flex size-11 items-center justify-center rounded-xl ${stat.tile} ${stat.color}`}><Icon size={21} /></div>
            </div>
            <p className="mt-4 text-3xl font-bold tracking-tight text-white">{stat.value}</p>
            <p className="mt-1 text-xs text-slate-500">Across this workspace</p>
          </div>;
        })}
      </div>

      {/* New Message Modal */}
      {showNewMessage && canCreateMessages && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/70
            p-4
            backdrop-blur-sm
          "
          onClick={handleCloseModal}
        >
          <div
            className="
              w-full max-w-2xl
              max-h-[90vh]
              overflow-y-auto
              rounded-2xl
              border border-slate-700/80
              bg-slate-900
              shadow-2xl
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* Modal Header */}
            <div
              className="
                flex items-center justify-between
                border-b border-slate-700/80
                px-6 py-5
              "
            >
              <div>
                <h2 className="text-lg font-semibold text-white">
                  New Message
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Write and send a new message.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="
                  rounded-lg
                  p-2
                  text-slate-500
                  transition-colors
                  hover:bg-slate-800
                  hover:text-white
                "
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div className="p-6">

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* Receiver */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Receiver
                  </label>

                  <select
                    value={receiver}
                    onChange={(event) => setReceiver(event.target.value)}
                    className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10"
                  >
                    <option value="">Select an active recipient...</option>
                    {availableRecipients.map((recipient) => (
                      <option key={recipient.id} value={recipient.name}>
                        {recipient.name} ({recipient.role})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Subject
                  </label>

                  <input
                    type="text"
                    value={subject}
                    onChange={(event) =>
                      setSubject(event.target.value)
                    }
                    placeholder="Enter message subject..."
                    className="
                      w-full
                      rounded-xl
                      border border-slate-700/80
                      bg-slate-950
                      px-4 py-3
                      text-sm text-white
                      outline-none
                      placeholder:text-slate-600
                      focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10
                    "
                  />
                </div>

                {/* Message */}
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Message
                  </label>

                  <textarea
                    value={content}
                    onChange={(event) =>
                      setContent(event.target.value)
                    }
                    placeholder="Write your message..."
                    rows={6}
                    className="
                      w-full
                      resize-none
                      rounded-xl
                      border border-slate-700/80
                      bg-slate-950
                      px-4 py-3
                      text-sm leading-6 text-white
                      outline-none
                      placeholder:text-slate-600
                      focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10
                    "
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div
                className="
                  mt-6
                  flex flex-col-reverse gap-3
                  sm:flex-row sm:justify-end
                "
              >
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="
                    rounded-xl
                    border border-slate-700/80
                    px-5 py-2.5
                    text-sm font-medium
                    text-slate-400
                    transition-colors
                    hover:bg-slate-800
                    hover:text-white
                  "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSendMessage}
                  disabled={
                    !receiver.trim() ||
                    !subject.trim() ||
                    !content.trim()
                  }
                  className="
                    rounded-xl
                    bg-cyan-300
                    px-5 py-2.5
                    text-sm font-semibold
                    text-slate-950
                    transition-colors
                    hover:bg-cyan-200
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/10">
        <div className="flex flex-col gap-3 border-b border-slate-800 bg-slate-900/80 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="relative w-full sm:max-w-sm">
            <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search messages..." className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10" />
          </div>
          <p className="text-xs text-slate-500">{filteredMessages.length} {filteredMessages.length === 1 ? "message" : "messages"} found</p>
        </div>
        <div className="flex flex-wrap gap-2 px-4 py-4 sm:px-5">
          {filters.map((filter) => {
            const active = activeFilter === filter;
            return (
              <button key={filter} type="button" onClick={() => setActiveFilter(filter)} className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition ${active ? "border-cyan-300/30 bg-cyan-300/10 text-cyan-200" : "border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600 hover:text-white"}`}>
                {filter}
                {filter === "Unread" && <span className="ml-2 text-xs opacity-70">{currentUser ? messages.filter((message) => message.receiver === currentUser.name && message.status === "Unread").length : 0}</span>}
              </button>
            );
          })}
        </div>
      </section>

      {/* Message List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredMessages.map((message) => (
          <Link
            key={message.id}
            href={`/messages/${message.id}`}
            className="
              rounded-2xl
              border border-slate-700/80
              bg-slate-900
              p-5
              transition-colors
              hover:border-slate-700
              hover:bg-slate-800/60
            "
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

              <div className="min-w-0 flex-1">

                {/* Subject */}
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Mail
                    size={18}
                    className="shrink-0 text-slate-500"
                  />

                  <h2
                    className={`
                      truncate
                      text-base
                      ${
                        message.receiver === currentUser?.name && message.status === "Unread"
                          ? "font-semibold text-white"
                          : "font-medium text-slate-300"
                      }
                    `}
                  >
                    {message.subject}
                  </h2>

                  {message.receiver === currentUser?.name && message.status === "Unread" && (
                    <span
                      className="
                        rounded-full
                        bg-slate-700
                        px-2 py-0.5
                        text-[11px]
                        font-medium
                        text-slate-200
                      "
                    >
                      Unread
                    </span>
                  )}
                </div>

                {/* Sender / Receiver */}
                <div className="mb-3 flex flex-col gap-1 text-sm text-slate-500 sm:flex-row sm:gap-4">
                  <span>
                    From: {message.sender}
                  </span>

                  <span>
                    To: {message.receiver}
                  </span>
                </div>

                {/* Content */}
                <p className="line-clamp-2 text-sm leading-6 text-slate-400">
                  {message.content}
                </p>
              </div>

              {/* Date */}
              <span className="shrink-0 rounded-lg border border-slate-700/70 bg-slate-950/70 px-2.5 py-1.5 text-xs text-slate-400">
                {message.date}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredMessages.length === 0 && (
        <div
          className="
            rounded-2xl
            border border-dashed
            border-slate-700/80
            bg-slate-900/50
            px-6 py-12
            text-center
          "
        >
          <p className="font-medium text-white">
            No messages found
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Try changing your search or filter.
          </p>
        </div>
      )}
    </div>
  );
}