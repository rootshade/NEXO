"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import CorrespondenceEditor, { type CorrespondenceAttachment } from "@/components/correspondence/CorrespondenceEditor";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  User,
  Calendar,
  Trash2,
} from "lucide-react";

import {
  initialLetters,
  type Letter,
} from "@/data/letters";
import { canAccess, canViewCorrespondence, getCurrentUser, isCorrespondenceRecipient } from "@/data/accessControl";

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
  const [accessDenied, setAccessDenied] = useState(false);

  const [accessVersion, setAccessVersion] = useState(0);
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const refreshAccess = () => setAccessVersion((version) => version + 1);
    window.addEventListener("nexo-current-user-updated", refreshAccess);
    window.addEventListener("nexo-permissions-updated", refreshAccess);
    window.addEventListener("nexo-users-updated", refreshAccess);
    window.addEventListener("storage", refreshAccess);

    return () => {
      window.removeEventListener("nexo-current-user-updated", refreshAccess);
      window.removeEventListener("nexo-permissions-updated", refreshAccess);
      window.removeEventListener("nexo-users-updated", refreshAccess);
      window.removeEventListener("storage", refreshAccess);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadLetter() {
      const { id } = await params;
      if (cancelled) return;
      setLetter(null);
      setAccessDenied(false);
      setLoading(true);
      if (!canAccess(getCurrentUser(), "letters.view")) {
        if (!cancelled) {
          setAccessDenied(true);
          setLoading(false);
        }
        return;
      }
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

      if (!canViewCorrespondence(foundLetter.sender, foundLetter.receiver, getCurrentUser())) {
        if (!cancelled) {
          setAccessDenied(true);
          setLoading(false);
        }
        return;
      }

      const currentUser = getCurrentUser();
      if (foundLetter.status === "Unread" && isCorrespondenceRecipient(foundLetter.receiver, currentUser)) {
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

    const timeoutId = window.setTimeout(() => {
      void loadLetter();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [params, accessVersion]);

  function confirmDeleteLetter() {
    if (!letter || letter.sender !== getCurrentUser()?.name) {
      setDeleteError("Only the sender can delete this letter.");
      return;
    }
    try {
      const raw = localStorage.getItem(LETTERS_STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) throw new Error("Invalid stored data");
      const next = parsed.filter((item) => item && typeof item === "object" && "id" in item && item.id !== letter.id);
      localStorage.setItem(LETTERS_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new Event("nexo-letters-updated"));
      setShowDeleteModal(false);
      router.push("/letters");
    } catch {
      setDeleteError("Could not delete this letter. Please try again.");
    }
  }

  function saveLetterContent(content: string, attachments: CorrespondenceAttachment[]) {
    const userName = getCurrentUser()?.name;
    if (!letter || !userName || (userName !== letter.sender && userName !== letter.receiver)) {
      throw new Error("Only the sender or recipient can edit this letter.");
    }
    const raw = localStorage.getItem(LETTERS_STORAGE_KEY);
    const stored: unknown = raw ? JSON.parse(raw) : initialLetters;
    if (!Array.isArray(stored)) throw new Error("Invalid letter data.");
    const updated = stored.map((item) => item && typeof item === "object" && "id" in item && item.id === letter.id
      ? { ...item, content, attachments }
      : item);
    localStorage.setItem(LETTERS_STORAGE_KEY, JSON.stringify(updated));
    setLetter({ ...letter, content, attachments });
    window.dispatchEvent(new Event("nexo-letters-updated"));
  }

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

  if (accessDenied) {
    return (
      <main className="p-6">
        <div className="mx-auto flex min-h-[50vh] max-w-4xl flex-col items-center justify-center text-center">
          <h1 className="text-xl font-semibold text-white">Access Denied</h1>
          <p className="mt-2 text-sm text-slate-500">You do not have permission to view letters.</p>
          <Link href="/dashboard" className="mt-6 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800">Back to Dashboard</Link>
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

              <div className="flex flex-wrap items-center gap-3">
                {letter.sender === getCurrentUser()?.name && <button type="button" onClick={() => { setDeleteError(""); setShowDeleteModal(true); }} className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10"><Trash2 size={16} /> Delete letter</button>}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                <Calendar className="h-4 w-4" />
                {letter.date}
                </div>
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
            <CorrespondenceEditor
              kind="Letter"
              content={letter.content}
              attachments={letter.attachments as CorrespondenceAttachment[] | undefined}
              onSave={saveLetterContent}
            />
          </div>
        </div>
        <ConfirmDeleteModal open={showDeleteModal} title="Delete letter?" description="This letter will be permanently deleted:" itemName={letter.subject} error={deleteError} onCancel={() => { setShowDeleteModal(false); setDeleteError(""); }} onConfirm={confirmDeleteLetter} />
      </div>
    </main>
  );
}
