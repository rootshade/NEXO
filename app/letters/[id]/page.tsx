"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  User,
  Calendar,
} from "lucide-react";

import {
  initialLetters,
  type Letter,
} from "@/data/letters";

type LetterDetailsPageProps = {
  params: Promise<{ id: string }>;
};

const LETTERS_STORAGE_KEY = "nexo-letters";

function getLettersFromStorage(): Letter[] {
  if (typeof window === "undefined") {
    return initialLetters;
  }

  const savedLetters = localStorage.getItem(LETTERS_STORAGE_KEY);

  if (!savedLetters) {
    return initialLetters;
  }

  try {
    const parsedLetters: unknown = JSON.parse(savedLetters);

    if (!Array.isArray(parsedLetters)) {
      throw new Error("Invalid letters data");
    }

    return parsedLetters as Letter[];
  } catch {
    localStorage.removeItem(LETTERS_STORAGE_KEY);
    return initialLetters;
  }
}

export default function LetterDetailsPage({
  params,
}: LetterDetailsPageProps) {
  const [letter, setLetter] = useState<Letter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadLetter() {
      const { id } = await params;
      const letters = getLettersFromStorage();
      const letterId = Number(id);

      if (!Number.isFinite(letterId)) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      const foundLetter = letters.find(
        (item) => item.id === letterId
      );

      if (!foundLetter) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      if (foundLetter.status === "Unread") {
        const updatedLetters = letters.map((item) =>
          item.id === foundLetter.id
            ? {
                ...item,
                status: "Read" as const,
              }
            : item
        );

        localStorage.setItem(
          LETTERS_STORAGE_KEY,
          JSON.stringify(updatedLetters)
        );
        window.dispatchEvent(
          new Event("nexo-letters-updated")
        );

        if (!cancelled) {
          setLetter({
            ...foundLetter,
            status: "Read",
          });
        }
      } else if (!cancelled) {
        setLetter(foundLetter);
      }

      if (!cancelled) {
        setLoading(false);
      }
    }

    window.setTimeout(() => {
      void loadLetter();
    }, 0);

    return () => {
      cancelled = true;
    };
  }, [params]);

  if (loading) {
    return (
      <main className="p-6">
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-sm text-slate-500">
            Loading letter...
          </p>
        </div>
      </main>
    );
  }

  if (!letter) {
    return (
      <main className="p-6">
        <div className="mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900">
            <Mail className="h-7 w-7 text-slate-500" />
          </div>

          <h1 className="text-xl font-semibold text-white">
            Letter not found
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            The requested letter does not exist.
          </p>

          <Link
            href="/letters"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Letters
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-6">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/letters"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Letters
        </Link>

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          <div className="border-b border-slate-800 p-5 sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800">
                    <Mail className="h-5 w-5 text-slate-300" />
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      letter.status === "Read"
                        ? "bg-slate-800 text-slate-400"
                        : letter.status === "Sent"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-blue-500/10 text-blue-400"
                    }`}
                  >
                    {letter.status}
                  </span>
                </div>

                <h1 className="text-xl font-semibold text-white sm:text-2xl">
                  {letter.subject}
                </h1>
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Calendar className="h-4 w-4" />
                {letter.date}
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-b border-slate-800 p-5 sm:grid-cols-2 sm:p-7">
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                <User className="h-4 w-4" />
                Sender
              </div>

              <p className="text-sm text-slate-200">
                {letter.sender}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                <User className="h-4 w-4" />
                Receiver
              </div>

              <p className="text-sm text-slate-200">
                {letter.receiver}
              </p>
            </div>
          </div>

          <div className="p-5 sm:p-7">
            <div className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">
              Letter Content
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-5">
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                {letter.content}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
