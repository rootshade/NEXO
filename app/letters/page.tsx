"use client";

import {
  Search,
  Plus,
  Mail,
  MailOpen,
  X,
} from "lucide-react";

import Link from "next/link";
import { useEffect, useState } from "react";
import { canAccess, canViewCorrespondence, getCurrentUser, getUsers, CURRENT_USER_EVENT, type AccessUser } from "@/data/accessControl";

import {
  initialLetters,
  type Letter,
} from "@/data/letters";

type LetterFilter =
  | "All"
  | "Unread"
  | "Read"
  | "Sent";

const filters: LetterFilter[] = [
  "All",
  "Unread",
  "Read",
  "Sent",
];

export default function LettersPage() {
  const [letters, setLetters] =
    useState<Letter[]>(initialLetters);

  const [isLoaded, setIsLoaded] = useState(false);
  const [canViewLetters, setCanViewLetters] = useState(false);
  const [canCreateLetters, setCanCreateLetters] = useState(false);
  const [currentUser, setCurrentUser] = useState<AccessUser | null>(null);
  const [availableRecipients, setAvailableRecipients] = useState<AccessUser[]>([]);

  const [activeFilter, setActiveFilter] =
    useState<LetterFilter>("All");

  const [search, setSearch] = useState("");

  const [showNewLetter, setShowNewLetter] =
    useState(false);

  const [subject, setSubject] = useState("");
  const [receiver, setReceiver] = useState("");
  const [content, setContent] = useState("");

  const [error, setError] = useState("");

  const visibleLetters = currentUser
    ? letters.filter((letter) => canViewCorrespondence(letter.sender, letter.receiver, currentUser))
    : [];

  const inboxLetters = currentUser
    ? visibleLetters.filter((letter) => letter.receiver === currentUser.name)
    : [];
  const sentLetters = currentUser
    ? visibleLetters.filter((letter) => letter.sender === currentUser.name)
    : [];
  const unreadCount = inboxLetters.filter((letter) => letter.status === "Unread").length;
  const readCount = inboxLetters.filter((letter) => letter.status === "Read").length;
  const sentCount = sentLetters.length;

  useEffect(() => {
    function syncLetterPermissions() {
      const user = getCurrentUser();
      setCurrentUser(user);
      setAvailableRecipients(getUsers().filter((candidate) => candidate.status === "Active" && candidate.id !== user.id));
      setCanViewLetters(canAccess(user, "letters.view"));
      setCanCreateLetters(canAccess(user, "letters.create"));
    }
    syncLetterPermissions();
    window.addEventListener(CURRENT_USER_EVENT, syncLetterPermissions);
    window.addEventListener("nexo-permissions-updated", syncLetterPermissions);
    window.addEventListener("nexo-users-updated", syncLetterPermissions);
    window.addEventListener("storage", syncLetterPermissions);
    return () => {
      window.removeEventListener(CURRENT_USER_EVENT, syncLetterPermissions);
      window.removeEventListener("nexo-permissions-updated", syncLetterPermissions);
      window.removeEventListener("nexo-users-updated", syncLetterPermissions);
      window.removeEventListener("storage", syncLetterPermissions);
    };
  }, []);

  /*
   * Load letters from localStorage after the initial render.
   * The deferred read keeps hydration deterministic in Next.js.
   */
  useEffect(() => {
    function syncLetters() {
      try {
        const savedLetters =
          localStorage.getItem("nexo-letters");

        if (!savedLetters) return;

        const parsedLetters: unknown = JSON.parse(savedLetters);

        if (Array.isArray(parsedLetters)) {
          setLetters(parsedLetters as Letter[]);
        } else {
          localStorage.removeItem("nexo-letters");
        }
      } catch {
        localStorage.removeItem("nexo-letters");
      }
    }

    const timer = window.setTimeout(() => {
      syncLetters();
      setIsLoaded(true);
    }, 0);

    window.addEventListener("nexo-letters-updated", syncLetters);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("nexo-letters-updated", syncLetters);
    };
  }, []);

  /*
   * Save letters to localStorage
   */
  useEffect(() => {
    if (!isLoaded) return;

    localStorage.setItem(
      "nexo-letters",
      JSON.stringify(letters)
    );
  }, [letters, isLoaded]);

  /*
   * Filter letters
   */
  const filteredLetters = visibleLetters.filter((letter) => {
    const isSender = currentUser?.name === letter.sender;
    const matchesFilter =
      activeFilter === "All" ||
      (activeFilter === "Sent" && isSender) ||
      (activeFilter === "Unread" && !isSender && letter.status === "Unread") ||
      (activeFilter === "Read" && !isSender && letter.status === "Read");

    const searchValue = search.toLowerCase();

    const matchesSearch =
      letter.subject
        .toLowerCase()
        .includes(searchValue) ||
      letter.sender
        .toLowerCase()
        .includes(searchValue) ||
      letter.receiver
        .toLowerCase()
        .includes(searchValue);

    return matchesFilter && matchesSearch;
  });

  /*
   * Send new letter
   */
  function handleSendLetter() {
    if (!canAccess(getCurrentUser(), "letters.create")) {
      setCanCreateLetters(false);
      setError("You do not have permission to send letters.");
      return;
    }
    const selectedRecipient = availableRecipients.find((candidate) => candidate.name === receiver);
    if (!selectedRecipient) {
      setError("Please select an active recipient from the list.");
      return;
    }

    if (!subject.trim()) {
      setError("Please enter a subject.");
      return;
    }

    if (!content.trim()) {
      setError("Please write the letter content.");
      return;
    }

    const newLetter: Letter = {
      id: Date.now(),
      subject: subject.trim(),
      sender: getCurrentUser().name,
      receiver: selectedRecipient.name,
      date: new Date().toISOString().split("T")[0],
      status: "Unread",
      content: content.trim(),
    };

    const updatedLetters = [newLetter, ...letters];
    localStorage.setItem("nexo-letters", JSON.stringify(updatedLetters));
    setLetters(updatedLetters);
    window.dispatchEvent(new Event("nexo-letters-updated"));

    setSubject("");
    setReceiver("");
    setContent("");
    setError("");
    setShowNewLetter(false);
  }

  /*
   * Close modal
   */
  function handleCloseModal() {
    setShowNewLetter(false);
    setSubject("");
    setReceiver("");
    setContent("");
    setError("");
  }

  if (!canViewLetters) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-slate-900 p-8 text-center">
        <h1 className="text-xl font-semibold text-white">Access Denied</h1>
        <p className="mt-2 text-sm text-slate-400">You do not have permission to view letters.</p>
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
            Letters
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Manage received and sent letters.
          </p>
        </div>

        {canCreateLetters && <button
          type="button"
          onClick={() => {
            setError("");
            setShowNewLetter(true);
          }}
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
          New Letter
        </button>}
        </div>
      </div>

      {/* Letter statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total Letters", value: visibleLetters.length, icon: Mail, color: "text-indigo-300", tile: "bg-indigo-400/10", border: "border-indigo-400/20" },
          { label: "Unread", value: unreadCount, icon: Mail, color: "text-sky-300", tile: "bg-sky-400/10", border: "border-sky-400/20" },
          { label: "Read", value: readCount, icon: MailOpen, color: "text-emerald-300", tile: "bg-emerald-400/10", border: "border-emerald-400/20" },
          { label: "Sent", value: sentCount, icon: Plus, color: "text-amber-300", tile: "bg-amber-400/10", border: "border-amber-400/20" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className={`rounded-2xl border ${stat.border} bg-slate-900 p-5 transition hover:-translate-y-0.5 hover:bg-slate-800/80`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-slate-400">{stat.label}</p>
                <div className={`flex size-11 items-center justify-center rounded-xl ${stat.tile} ${stat.color}`}>
                  <Icon size={21} />
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-white">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-500">Across this workspace</p>
            </div>
          );
        })}
      </div>

      {/* New Letter Modal */}
      {showNewLetter && canCreateLetters && (
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
              border border-slate-700
              bg-slate-900
              shadow-2xl shadow-black/40
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* Modal Header */}
            <div
              className="
                flex items-center justify-between
                border-b border-slate-800
                bg-gradient-to-r from-indigo-950/70 to-slate-900
                px-6 py-5
              "
            >
              <div>
                <h2 className="text-lg font-semibold text-white">
                  New Letter
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Write and send a new letter.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="
                  flex h-9 w-9
                  items-center justify-center
                  rounded-lg
                  text-slate-500
                  transition-colors
                  hover:bg-slate-800
                  hover:text-white
                "
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-5 px-6 py-6">
              {/* Error */}
              {error && (
                <div
                  className="
                    rounded-xl
                    border border-red-500/20
                    bg-red-500/10
                    px-4 py-3
                    text-sm text-red-400
                  "
                >
                  {error}
                </div>
              )}

              {/* Receiver */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Receiver
                </label>

                <select
                  value={receiver}
                  onChange={(event) => {
                    setReceiver(event.target.value);
                    setError("");
                  }}
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
                  onChange={(event) => {
                    setSubject(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter letter subject..."
                  className="
                    w-full
                    rounded-xl
                    border border-slate-700/80
                    bg-slate-950
                    px-4 py-3
                    text-sm text-white
                    outline-none
                    placeholder:text-slate-600
                    transition-colors
                    focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10
                    focus:ring-1
                    focus:ring-slate-600
                  "
                />
              </div>

              {/* Content */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Letter Content
                </label>

                <textarea
                  value={content}
                  onChange={(event) => {
                    setContent(event.target.value);
                    setError("");
                  }}
                  placeholder="Write your letter..."
                  rows={7}
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border border-slate-700/80
                    bg-slate-950
                    px-4 py-3
                    text-sm text-white
                    outline-none
                    placeholder:text-slate-600
                    transition-colors
                    focus:border-cyan-400/60 focus:ring-2 focus:ring-cyan-400/10
                    focus:ring-1
                    focus:ring-slate-600
                  "
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="
                flex flex-col-reverse gap-3
                border-t border-slate-800
                bg-slate-950/40
                px-6 py-5
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
                onClick={handleSendLetter}
                className="
                  rounded-xl
                  bg-cyan-300
                  px-5 py-2.5
                  text-sm font-semibold
                  text-slate-950
                  transition-colors
                  hover:bg-cyan-200
                "
              >
                Send Letter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl shadow-black/10">
        <div className="border-b border-slate-800 bg-slate-900/80 p-4 sm:p-5">
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
          placeholder="Search letters..."
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

          </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 px-4 py-4 sm:px-5">
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
                    ? "border border-cyan-300/20 bg-cyan-300/10 text-cyan-200"
                    : "border border-transparent text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white"
                }
              `}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Letters */}
      <div className="space-y-3 p-4 sm:p-5">
        {filteredLetters.map((letter) => (
          <Link
            key={letter.id}
            href={`/letters/${letter.id}`}
            className="
              group
              block
              rounded-2xl
              border border-slate-800
              bg-gradient-to-br from-slate-900 to-slate-900/80
              p-5
              shadow-sm shadow-black/10
              transition duration-200
              hover:-translate-y-0.5
              hover:border-cyan-400/30
              hover:bg-slate-800/70
            "
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              {/* Main Info */}
              <div className="flex min-w-0 gap-4">
                <div
                  className="
                    flex h-11 w-11 shrink-0
                    items-center justify-center
                    rounded-xl
                    border border-indigo-400/15
                    bg-gradient-to-br from-indigo-400/10 to-cyan-400/10
                    text-cyan-200
                  "
                >
                  {letter.sender === currentUser?.name ? (
                    <Mail size={20} />
                  ) : letter.status === "Unread" ? (
                    <Mail size={20} />
                  ) : (
                    <MailOpen size={20} />
                  )}
                </div>

                <div className="min-w-0">
                  <h2
                    className="
                      truncate
                      text-sm font-semibold
                      text-white
                    "
                  >
                    {letter.subject}
                  </h2>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>
                      From:{" "}
                      <span className="text-slate-400">
                        {letter.sender}
                      </span>
                    </span>

                    <span>
                      To:{" "}
                      <span className="text-slate-400">
                        {letter.receiver}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Status + Date */}
              <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-end">
                <span
                  className={`
                    rounded-lg
                    px-2.5 py-1
                    text-xs font-medium
                    ${
                      letter.sender === currentUser?.name
                        ? "border border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                        : letter.status === "Unread"
                        ? "border border-sky-400/20 bg-sky-400/10 text-sky-300"
                        : "border border-slate-700 bg-slate-800 text-slate-300"
                    }
                  `}
                >
                  {letter.sender === currentUser?.name ? "Sent" : letter.status}
                </span>

                <span className="text-xs text-slate-600">
                  {letter.date}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      </section>

      {/* Empty State */}
      {filteredLetters.length === 0 && (
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
            No letters found
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Try changing your search or filter.
          </p>
        </div>
      )}
    </div>
  );
}
