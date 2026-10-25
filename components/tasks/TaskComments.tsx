"use client";

import { useEffect, useState } from "react";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import { getCurrentUser } from "@/data/accessControl";
import { canManageTaskComment } from "@/data/commentOwnership.cjs";
import {
  Check,
  MessageCircle,
  Pencil,
  Send,
  Trash2,
  X,
} from "lucide-react";

type TaskComment = {
  id: number;
  taskId: number;
  author: string;
  authorId?: string;
  message: string;
  createdAt: string;
  updatedAt?: string;
};

type TaskCommentsProps = {
  taskId: number;
};

const STORAGE_KEY = "nexo_task_comments";
const MAX_COMMENT_LENGTH = 3000;

function isTaskComment(value: unknown): value is TaskComment {
  if (!value || typeof value !== "object") return false;
  const comment = value as Partial<TaskComment>;
  return (
    typeof comment.id === "number" &&
    typeof comment.taskId === "number" &&
    typeof comment.author === "string" &&
    (comment.authorId === undefined || typeof comment.authorId === "string") &&
    typeof comment.message === "string" &&
    typeof comment.createdAt === "string"
  );
}

export default function TaskComments({ taskId }: TaskCommentsProps) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [message, setMessage] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [editingMessage, setEditingMessage] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        const saved = Array.isArray(parsed) ? parsed.filter(isTaskComment) : [];
        const taskComments = saved.filter((comment) => comment.taskId === taskId);
        setComments(taskComments);
      } catch {
        setComments([]);
      } finally {
        setIsLoaded(true);
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [taskId]);

  function saveTaskComments(nextComments: TaskComment[]) {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    const saved = Array.isArray(parsed) ? parsed.filter(isTaskComment) : [];
    const otherComments = saved.filter((comment) => comment.taskId !== taskId);
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([...otherComments, ...nextComments])
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || !isLoaded || trimmedMessage.length > MAX_COMMENT_LENGTH) return;

    const currentUser = getCurrentUser();
    if (currentUser.status !== "Active") {
      window.alert("An active account is required to post comments.");
      return;
    }

    const newComment: TaskComment = {
      id: Date.now(),
      taskId,
      author: currentUser.name,
      authorId: currentUser.id,
      message: trimmedMessage,
      createdAt: new Date().toISOString(),
    };
    const nextComments = [...comments, newComment];

    try {
      saveTaskComments(nextComments);
      setComments(nextComments);
      setMessage("");
    } catch {
      window.alert("The comment could not be saved. Please try again.");
    }
  }

  function startEditing(comment: TaskComment) {
    setEditingCommentId(comment.id);
    setEditingMessage(comment.message);
  }

  function cancelEditing() {
    setEditingCommentId(null);
    setEditingMessage("");
  }

  function handleEdit(commentId: number) {
    const existingComment = comments.find((comment) => comment.id === commentId);
    if (!existingComment || !canManageTaskComment(existingComment, getCurrentUser())) return;

    const trimmedMessage = editingMessage.trim();
    if (!trimmedMessage) {
      window.alert("Comment cannot be empty.");
      return;
    }
    if (trimmedMessage.length > MAX_COMMENT_LENGTH) {
      window.alert(`Comment cannot exceed ${MAX_COMMENT_LENGTH} characters.`);
      return;
    }

    const nextComments = comments.map((comment) =>
      comment.id === commentId
        ? { ...comment, message: trimmedMessage, updatedAt: new Date().toISOString() }
        : comment
    );

    try {
      saveTaskComments(nextComments);
      setComments(nextComments);
      cancelEditing();
    } catch {
      window.alert("The edit could not be saved. Please try again.");
    }
  }

  function handleDelete(commentId: number) {
    const comment = comments.find((item) => item.id === commentId);
    if (!comment || !canManageTaskComment(comment, getCurrentUser())) return;
    setDeleteError("");
    setPendingDeleteId(commentId);
  }

  function confirmDeleteComment() {
    if (pendingDeleteId === null) return;
    const commentId = pendingDeleteId;
    const nextComments = comments.filter((item) => item.id !== commentId);
    try {
      saveTaskComments(nextComments);
      setComments(nextComments);
      if (editingCommentId === commentId) cancelEditing();
      setPendingDeleteId(null);
      setDeleteError("");
    } catch {
      setDeleteError("The comment could not be deleted. Please try again.");
    }
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-2">
        <MessageCircle size={18} className="text-slate-400" />
        <h2 className="text-lg font-semibold text-white">Discussion</h2>
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
          {comments.length}
        </span>
      </div>

      <div className="space-y-3">
        {!isLoaded ? (
          <p className="text-sm text-slate-500">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-slate-500">No comments yet. Start the discussion.</p>
        ) : (
          comments.map((comment) => (
            <article
              key={comment.id}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="truncate text-sm font-medium text-slate-200">
                    {comment.author}
                  </span>
                  {comment.updatedAt && (
                    <span className="shrink-0 text-xs text-slate-600">Edited</span>
                  )}
                </div>
                <time className="shrink-0 text-xs text-slate-500">
                  {new Date(comment.createdAt).toLocaleString()}
                </time>
              </div>

              {editingCommentId === comment.id ? (
                <div className="space-y-3">
                  <textarea
                    value={editingMessage}
                    onChange={(event) => setEditingMessage(event.target.value)}
                    rows={3}
                    maxLength={MAX_COMMENT_LENGTH}
                    aria-label="Edit comment"
                    className="w-full resize-y rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-slate-500"
                    autoFocus
                  />
                  <div className="flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800"
                    >
                      <X size={14} />
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(comment.id)}
                      disabled={!editingMessage.trim()}
                      className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Check size={14} />
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-400">
                    {comment.message}
                  </p>

                  {canManageTaskComment(comment, getCurrentUser()) && (
                    <div className="mt-3 flex justify-end gap-2 border-t border-slate-800/80 pt-3">
                      <button
                        type="button"
                        onClick={() => startEditing(comment)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
                        aria-label="Edit comment"
                      >
                        <Pencil size={13} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(comment.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
                        aria-label="Delete comment"
                      >
                        <Trash2 size={13} />
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </article>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <label
          htmlFor={`task-comment-${taskId}`}
          className="block text-sm font-medium text-slate-300"
        >
          Add a comment
        </label>
        <textarea
          id={`task-comment-${taskId}`}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          maxLength={MAX_COMMENT_LENGTH}
          placeholder="Write your comment..."
          className="w-full resize-y rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-slate-600"
        />
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-slate-600">
            {message.length}/{MAX_COMMENT_LENGTH}
          </span>
          <button
            type="submit"
            disabled={!message.trim() || !isLoaded}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send size={15} />
            Post Comment
          </button>
        </div>
      </form>
    <ConfirmDeleteModal open={pendingDeleteId !== null} title="Delete comment?" description="Are you sure you want to delete this comment?" error={deleteError} onCancel={() => { setPendingDeleteId(null); setDeleteError(""); }} onConfirm={confirmDeleteComment} />
    </section>
  );
}
