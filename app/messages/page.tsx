"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Mail, Plus, Search, X } from "lucide-react";

import {
  initialMessages,
  type Message,
} from "@/data/messages";

type MessageFilter = "All" | "Unread" | "Read";

const filters: MessageFilter[] = [
  "All",
  "Unread",
  "Read",
];

export default function MessagesPage() {
  const [messages, setMessages] =
    useState<Message[]>(initialMessages);

  const [isLoaded, setIsLoaded] = useState(false);

  const [activeFilter, setActiveFilter] =
    useState<MessageFilter>("All");

  const [search, setSearch] = useState("");

  const [showNewMessage, setShowNewMessage] =
    useState(false);

  const [receiver, setReceiver] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");

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
    return messages.filter((message) => {
      const matchesFilter =
        activeFilter === "All" ||
        message.status === activeFilter;

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
  }, [messages, activeFilter, search]);

  // Create new message
  function handleSendMessage() {
    if (
      !receiver.trim() ||
      !subject.trim() ||
      !content.trim()
    ) {
      return;
    }

    const newMessage: Message = {
      id: Date.now(),
      sender: "Mohammad",
      receiver: receiver.trim(),
      subject: subject.trim(),
      content: content.trim(),
      date: new Date()
        .toISOString()
        .slice(0, 16)
        .replace("T", " "),
      status: "Read",
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

        <button
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
        </button>
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessage && (
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

                  <input
                    type="text"
                    value={receiver}
                    onChange={(event) =>
                      setReceiver(event.target.value)
                    }
                    placeholder="Enter receiver name..."
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

      {/* Search */}
      <div className="relative">
        <Search
          size={18}
          className="
            absolute left-4 top-1/2
            -translate-y-1/2
            text-slate-500
          "
        />

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search messages..."
          className="
            w-full
            rounded-xl
            border border-slate-700/80
            bg-slate-900
            py-3 pl-11 pr-4
            text-sm text-white
            outline-none
            placeholder:text-slate-500
            transition-colors
            focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10
          "
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((filter) => {
          const active =
            activeFilter === filter;

          return (
            <button
              key={filter}
              type="button"
              onClick={() =>
                setActiveFilter(filter)
              }
              className={`
                shrink-0
                rounded-lg
                px-4 py-2
                text-sm font-medium
                transition-colors
                ${
                  active
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:bg-cyan-400/10 hover:text-cyan-200"
                }
              `}
            >
              {filter}
            </button>
          );
        })}
      </div>

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
                        message.status === "Unread"
                          ? "font-semibold text-white"
                          : "font-medium text-slate-300"
                      }
                    `}
                  >
                    {message.subject}
                  </h2>

                  {message.status === "Unread" && (
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
              <span className="shrink-0 text-xs text-slate-500">
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