"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Paperclip,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Mic,
  Download,
  LoaderCircle,
} from "lucide-react";
import {
  deleteTaskAttachment,
  getTaskAttachmentFile,
  getTaskAttachments,
  saveTaskAttachment,
  type TaskAttachment,
  type TaskAttachmentType,
} from "@/data/taskAttachmentStore";

type TaskAttachmentsProps = {
  taskId: number;
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".txt"];

function isSupportedAttachment(file: File): boolean {
  const name = file.name.toLowerCase();
  return (
    file.type.startsWith("image/") ||
    file.type.startsWith("audio/") ||
    ALLOWED_EXTENSIONS.some((extension) => name.endsWith(extension))
  );
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getAttachmentIcon(type: TaskAttachmentType) {
  switch (type) {
    case "image":
      return <ImageIcon size={18} />;
    case "audio":
      return <Mic size={18} />;
    case "file":
    default:
      return <FileText size={18} />;
  }
}

export default function TaskAttachments({ taskId }: TaskAttachmentsProps) {
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState<TaskAttachment | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const refreshAttachments = useCallback(async () => {
    setIsLoading(true);
    try {
      setAttachments(await getTaskAttachments(taskId));
      setError("");
    } catch {
      setError("Could not load attachments from this browser.");
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refreshAttachments();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [refreshAttachments]);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    if (!isSupportedAttachment(file)) {
      setError("Unsupported file type. Choose an image, audio file, PDF, DOC, DOCX, or TXT.");
      input.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File is too large. Maximum file size is 10 MB.");
      input.value = "";
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      await saveTaskAttachment(taskId, file);
      await refreshAttachments();
      setShowUpload(false);
    } catch {
      setError("Could not save this file. Your browser may be out of storage space.");
    } finally {
      setIsSaving(false);
      input.value = "";
    }
  }

  function handleRemove(attachment: TaskAttachment) {
    setDeleteError("");
    setPendingDelete(attachment);
  }

  async function confirmRemove() {
    if (!pendingDelete || busyId) return;

    const attachment = pendingDelete;
    setBusyId(attachment.id);
    setDeleteError("");
    try {
      await deleteTaskAttachment(attachment.id);
      setAttachments((current) => current.filter((item) => item.id !== attachment.id));
      setPendingDelete(null);
    } catch {
      setDeleteError("Could not delete this attachment. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleDownload(attachment: TaskAttachment) {
    setBusyId(attachment.id);
    setError("");

    try {
      const stored = await getTaskAttachmentFile(attachment.id);
      if (!stored) {
        setError("The stored file could not be found.");
        return;
      }

      const url = URL.createObjectURL(stored.blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = stored.name;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError("Could not open this attachment. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="mt-8 border-t border-slate-800 pt-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Paperclip size={18} className="text-slate-400" />
            <h2 className="text-sm font-semibold text-white">Attachments</h2>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
              {attachments.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Attach images, audio, PDFs, and documents to this task. Maximum 10 MB per file.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowUpload((current) => !current);
            setError("");
          }}
          className="flex w-fit items-center gap-2 rounded-xl border border-slate-800 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
        >
          <Upload size={16} />
          Add Attachment
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {showUpload && (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-6">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl px-4 py-8 text-center transition-colors hover:bg-slate-900">
            {isSaving ? (
              <LoaderCircle size={24} className="animate-spin text-slate-400" />
            ) : (
              <Upload size={24} className="text-slate-500" />
            )}
            <span className="mt-3 text-sm font-medium text-slate-300">
              {isSaving ? "Saving file..." : "Choose a file"}
            </span>
            <span className="mt-1 text-xs text-slate-500">
              Images, audio, PDF, DOC, DOCX, and TXT
            </span>
            <input
              type="file"
              className="sr-only"
              disabled={isSaving}
              accept="image/*,audio/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
            />
          </label>
        </div>
      )}

      <div className="mt-5 space-y-3">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading attachments...</p>
        ) : attachments.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-8 text-center">
            <p className="text-sm text-slate-500">No attachments yet.</p>
          </div>
        ) : (
          attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-slate-400">
                  {getAttachmentIcon(attachment.type)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white">{attachment.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {formatFileSize(attachment.size)} · {new Date(attachment.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => void handleDownload(attachment)}
                  disabled={busyId === attachment.id}
                  className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white disabled:opacity-50"
                  aria-label={`Download ${attachment.name}`}
                  title="Download"
                >
                  <Download size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => void handleRemove(attachment)}
                  disabled={busyId === attachment.id}
                  className="flex size-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                  aria-label={`Remove ${attachment.name}`}
                  title="Remove attachment"
                >
                  {busyId === attachment.id ? <LoaderCircle size={16} className="animate-spin" /> : <X size={17} />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {pendingDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !busyId) {
              setPendingDelete(null);
              setDeleteError("");
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-attachment-title"
            aria-describedby="delete-attachment-description"
            className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl shadow-black/40"
          >
            <div className="flex items-start gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                <X size={22} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 id="delete-attachment-title" className="text-base font-semibold text-white">
                  Confirm deletion
                </h3>
                <p id="delete-attachment-description" className="mt-2 text-sm leading-6 text-slate-300">
                  Are you sure you want to remove{" "}
                  <span className="break-words font-medium text-white">{pendingDelete.name}</span>{" "}
                  from this task? This action cannot be undone.
                </p>
              </div>
            </div>

            {deleteError && (
              <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {deleteError}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={Boolean(busyId)}
                onClick={() => {
                  setPendingDelete(null);
                  setDeleteError("");
                }}
                className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(busyId)}
                onClick={() => void confirmRemove()}
                className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busyId ? <LoaderCircle size={16} className="animate-spin" /> : null}
                {busyId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
