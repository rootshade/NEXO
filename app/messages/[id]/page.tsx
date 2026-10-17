"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Mail,
  User,
} from "lucide-react";

import {
  initialMessages,
  type Message,
} from "@/data/messages";
import { canAccess, canViewCorrespondence, getCurrentUser, isCorrespondenceRecipient } from "@/data/accessControl";

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

  useEffect(() => {
    async function loadMessage() {
      const { id } = await params;

      if (!canAccess(getCurrentUser(), "messages.view")) {
        setAccessDenied(true);
        setLoading(false);
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
        setLoading(false);
        return;
      }

      if (!canViewCorrespondence(foundMessage.sender, foundMessage.receiver, getCurrentUser())) {
        setAccessDenied(true);
        setLoading(false);
        return;
      }

      /*
       * Only mark the message as Read
       * when the user actually opens it.
       */
      const currentUser = getCurrentUser();
      if (foundMessage.status === "Unread" && isCorrespondenceRecipient(foundMessage.receiver, currentUser)) {
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

        setMessage({
          ...foundMessage,
          status: "Read",
        });
      } else {
        setMessage(foundMessage);
      }

      setLoading(false);
    }

    loadMessage();
  }, [params]);

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

        {/* Content */}
        <div className="px-6 py-6">
          <div className="mb-3 flex items-center gap-2">
            <Mail
              size={17}
              className="text-slate-500"
            />

            <h2 className="text-sm font-semibold text-slate-300">
              Message
            </h2>
          </div>

          <div
            className="
              rounded-xl
              border border-slate-800
              bg-slate-950
              p-5
            "
          >
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
              {message.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}