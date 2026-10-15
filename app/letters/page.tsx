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

  const [activeFilter, setActiveFilter] =
    useState<LetterFilter>("All");

  const [search, setSearch] = useState("");

  const [showNewLetter, setShowNewLetter] =
    useState(false);

  const [subject, setSubject] = useState("");
  const [receiver, setReceiver] = useState("");
  const [content, setContent] = useState("");

  const [error, setError] = useState("");

  /*
   * Load letters from localStorage after the initial render.
   * The deferred read keeps hydration deterministic in Next.js.
   */
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedLetters =
        localStorage.getItem("nexo-letters");

      if (savedLetters) {
        try {
          setLetters(JSON.parse(savedLetters));
        } catch {
          localStorage.removeItem("nexo-letters");
        }
      }

      setIsLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
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
  const filteredLetters = letters.filter((letter) => {
    const matchesFilter =
      activeFilter === "All" ||
      letter.status === activeFilter;

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
    if (!receiver.trim()) {
      setError("Please enter a receiver.");
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
      sender: "Mohammad",
      receiver: receiver.trim(),
      date: new Date().toISOString().split("T")[0],
      status: "Sent",
      content: content.trim(),
    };

    setLetters((currentLetters) => [
      newLetter,
      ...currentLetters,
    ]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Letters
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            Manage received and sent letters.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError("");
            setShowNewLetter(true);
          }}
          className="
            flex items-center justify-center gap-2
            rounded-xl
            bg-white
            px-4 py-2.5
            text-sm font-semibold
            text-slate-950
            transition-colors
            hover:bg-slate-200
          "
        >
          <Plus size={18} />
          New Letter
        </button>
      </div>

      {/* New Letter Modal */}
      {showNewLetter && (
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
              border border-slate-800
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
                border-b border-slate-800
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

                <input
                  type="text"
                  value={receiver}
                  onChange={(event) => {
                    setReceiver(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter receiver name..."
                  className="
                    w-full
                    rounded-xl
                    border border-slate-800
                    bg-slate-950
                    px-4 py-3
                    text-sm text-white
                    outline-none
                    placeholder:text-slate-600
                    transition-colors
                    focus:border-slate-600
                    focus:ring-1
                    focus:ring-slate-600
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
                  onChange={(event) => {
                    setSubject(event.target.value);
                    setError("");
                  }}
                  placeholder="Enter letter subject..."
                  className="
                    w-full
                    rounded-xl
                    border border-slate-800
                    bg-slate-950
                    px-4 py-3
                    text-sm text-white
                    outline-none
                    placeholder:text-slate-600
                    transition-colors
                    focus:border-slate-600
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
                    border border-slate-800
                    bg-slate-950
                    px-4 py-3
                    text-sm text-white
                    outline-none
                    placeholder:text-slate-600
                    transition-colors
                    focus:border-slate-600
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
                px-6 py-5
                sm:flex-row sm:justify-end
              "
            >
              <button
                type="button"
                onClick={handleCloseModal}
                className="
                  rounded-xl
                  border border-slate-800
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
                  bg-white
                  px-5 py-2.5
                  text-sm font-semibold
                  text-slate-950
                  transition-colors
                  hover:bg-slate-200
                "
              >
                Send Letter
              </button>
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
          placeholder="Search letters..."
          className="
            w-full
            rounded-xl
            border border-slate-800
            bg-slate-900
            py-3 pl-11 pr-4
            text-sm text-white
            outline-none
            placeholder:text-slate-500
            transition-colors
            focus:border-slate-600
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
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }
              `}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Letters */}
      <div className="space-y-3">
        {filteredLetters.map((letter) => (
          <Link
            key={letter.id}
            href={`/letters/${letter.id}`}
            className="
              group
              block
              rounded-2xl
              border border-slate-800
              bg-slate-900
              p-5
              transition-colors
              hover:border-slate-700
              hover:bg-slate-900/80
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
                    bg-slate-800
                    text-slate-400
                  "
                >
                  {letter.status === "Unread" ? (
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
                      letter.status === "Unread"
                        ? "bg-blue-500/10 text-blue-400"
                        : letter.status === "Read"
                        ? "bg-slate-800 text-slate-400"
                        : "bg-green-500/10 text-green-400"
                    }
                  `}
                >
                  {letter.status}
                </span>

                <span className="text-xs text-slate-600">
                  {letter.date}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {filteredLetters.length === 0 && (
        <div
          className="
            rounded-2xl
            border border-dashed
            border-slate-800
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
