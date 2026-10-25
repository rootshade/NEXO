"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import CorrespondenceEditor, { type CorrespondenceAttachment } from "@/components/correspondence/CorrespondenceEditor";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Mail,
  User,
  Trash2,
} from "lucide-react";

import {
  initialMessages,
  type Message,
} from "@/data/messages";
import { canAccess, canViewCorrespondenceRecord, isCorrespondenceRecipientRecord, isCorrespondenceSenderRecord, getCurrentUser } from "@/data/accessControl";

type MessageDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default function MessageDetailsPage({
  params,
}: MessageDetailsPageProps) {
  const [message, setMessage] =
    useState<Message | null>(null);

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

    async function loadMessage() {
      const { id } = await params;
      if (cancelled) return;
      setMessage(null);
      setAccessDenied(false);
      setLoading(true);

      if (!canAccess(getCurrentUser(), "messages.view")) {
        if (!cancelled) {
          setAccessDenied(true);
          setLoading(false);
        }
        return;
      }

      const savedMessages =
        localStorage.getItem("nexo-messages");

      let messages: Message[] = initialMessages;

      if (savedMessages) {
        try {
          messages = JSON.parse(savedMessages);
        } catch {
          localStorage.removeItem("nexo-messages");
        }
      }

      const foundMessage = messages.find(
        (item) => item.id === Number(id)
      );

      if (!foundMessage) {
        if (!cancelled) setLoading(false);
        return;
      }

      if (!canViewCorrespondenceRecord(foundMessage, getCurrentUser())) {
        if (!cancelled) {
          setAccessDenied(true);
          setLoading(false);
        }
        return;
      }

      /*
       * Only mark the message as Read
       * when the user actually opens it.
       */
      const currentUser = getCurrentUser();
      if (foundMessage.status === "Unread" && isCorrespondenceRecipientRecord(foundMessage, currentUser)) {
        const updatedMessages = messages.map(
          (item) =>
            item.id === foundMessage.id
              ? {
                  ...item,
                  status: "Read" as const,
                }
              : item
        );

        localStorage.setItem(
          "nexo-messages",
          JSON.stringify(updatedMessages)
        );

        window.dispatchEvent(new Event("nexo-messages-updated"));

        if (!cancelled) {
          setMessage({
            ...foundMessage,
            status: "Read",
          });
        }
      } else if (!cancelled) {
        setMessage(foundMessage);
      }

      if (!cancelled) setLoading(false);
    }

    void loadMessage();

    return () => {
      cancelled = true;
    };
  }, [params, accessVersion]);

  function confirmDeleteMessage() {
    if (!message || !isCorrespondenceSenderRecord(message, getCurrentUser())) {
      setDeleteError("Only the sender can delete this message.");
      return;
    }
    try {
      const raw = localStorage.getItem("nexo-messages");
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) throw new Error("Invalid stored data");
      const next = parsed.filter((item) => item && typeof item === "object" && "id" in item && item.id !== message.id);
      localStorage.setItem("nexo-messages", JSON.stringify(next));
      window.dispatchEvent(new Event("nexo-messages-updated"));
      setShowDeleteModal(false);
      router.push("/messages");
    } catch {
      setDeleteError("Could not delete this message. Please try again.");
    }
  }

  function saveMessageContent(content: string, attachments: CorrespondenceAttachment[]) {
    const userName = getCurrentUser()?.name;
    if (!message || !userName || (!isCorrespondenceSenderRecord(message, getCurrentUser()) && !isCorrespondenceRecipientRecord(message, getCurrentUser()))) {
      throw new Error("Only the sender or recipient can edit this message.");
    }
    const raw = localStorage.getItem("nexo-messages");
    const stored: unknown = raw ? JSON.parse(raw) : initialMessages;
    if (!Array.isArray(stored)) throw new Error("Invalid message data.");
    const updated = stored.map((item) => item && typeof item === "object" && "id" in item && item.id === message.id
      ? { ...item, content, attachments }
      : item);
    localStorage.setItem("nexo-messages", JSON.stringify(updated));
    const updatedMessage = { ...message, content, attachments };
    setMessage(updatedMessage);
    window.dispatchEvent(new Event("nexo-messages-updated"));
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-slate-500">
            Loading message...
          </p>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-slate-900 p-8 text-center">
        <h1 className="text-xl font-semibold text-white">Access Denied</h1>
        <p className="mt-2 text-sm text-slate-400">You do not have permission to view messages.</p>
        <Link href="/dashboard" className="mt-6 inline-flex rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800">Back to Dashboard</Link>
      </div>
    );
  }

  // Message not found
  if (!message) {
    return (
      <div className="space-y-6">

        <Link
          href="/messages"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            text-slate-400
            transition-colors
            hover:text-white
          "
        >
          <ArrowLeft size={17} />
          Back to Messages
        </Link>

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
            Message not found
          </p>

          <p className="mt-1 text-sm text-slate-500">
            The message you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Back */}
      <Link
        href="/messages"
        className="
          inline-flex
          items-center
          gap-2
          text-sm
          text-slate-400
          transition-colors
          hover:text-white
        "
      >
        <ArrowLeft size={17} />
        Back to Messages
      </Link>

      {/* Message Card */}
      <div
        className="
          rounded-2xl
          border border-slate-800
          bg-slate-900
          shadow-sm
        "
      >

        {/* Header */}
        <div
          className="
            border-b border-slate-800
            px-6 py-5
          "
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

            <div className="min-w-0">

              {/* Status */}
              <div className="mb-3 flex items-center gap-2">
                <span
                  className="
                    rounded-full
                    bg-slate-700
                    px-2.5 py-1
                    text-xs
                    font-medium
                    text-slate-200
                  "
                >
                  {message.status}
                </span>
              </div>

              {/* Subject */}
              <h1 className="text-xl font-bold text-white sm:text-2xl">
                {message.subject}
              </h1>
            </div>

            {isCorrespondenceSenderRecord(message, getCurrentUser()) && <button type="button" onClick={() => { setDeleteError(""); setShowDeleteModal(true); }} className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 px-3 py-2 text-sm text-red-300 transition hover:bg-red-500/10"><Trash2 size={16} /> Delete message</button>}

            {/* Date */}
            <div
              className="
                flex
                shrink-0
                items-center
                gap-2
                text-sm
                text-slate-500
              "
            >
              <Calendar size={16} />
              {message.date}
            </div>
          </div>
        </div>

        {/* Sender / Receiver */}
        <div
          className="
            grid
            grid-cols-1
            gap-4
            border-b border-slate-800
            px-6 py-5
            md:grid-cols-2
          "
        >

          {/* Sender */}
          <div
            className="
              rounded-xl
              border border-slate-800
              bg-slate-950
              p-4
            "
          >
            <div className="mb-2 flex items-center gap-2">
              <User
                size={16}
                className="text-slate-500"
              />

              <span className="text-xs text-slate-500">
                From
              </span>
            </div>

            <p className="text-sm font-medium text-white">
              {message.sender}
            </p>
          </div>

          {/* Receiver */}
          <div
            className="
              rounded-xl
              border border-slate-800
              bg-slate-950
              p-4
            "
          >
            <div className="mb-2 flex items-center gap-2">
              <Mail
                size={16}
                className="text-slate-500"
              />

              <span className="text-xs text-slate-500">
                To
              </span>
            </div>

            <p className="text-sm font-medium text-white">
              {message.receiver}
            </p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <CorrespondenceEditor
            kind="Message"
            content={message.content}
            attachments={message.attachments as CorrespondenceAttachment[] | undefined}
            onSave={saveMessageContent}
          />
        </div>
        <ConfirmDeleteModal open={showDeleteModal} title="Delete message?" description="This message will be permanently deleted:" itemName={message.subject} error={deleteError} onCancel={() => { setShowDeleteModal(false); setDeleteError(""); }} onConfirm={confirmDeleteMessage} />
      </div>
    </div>
  );
}