"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Send } from "lucide-react";

type TaskComment = {
  id: number;
  author: string;
  message: string;
  createdAt: string;
};

type TaskCommentsProps = {
  taskId: number;
};

const STORAGE_KEY = "nexo_task_comments";
const CURRENT_USER = "Mohammad";

export default function TaskComments({ taskId }: TaskCommentsProps) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [message, setMessage] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const saved: TaskComment[] = raw ? JSON.parse(raw) : [];
      const taskComments = saved.filter((comment) => {
        return (comment as TaskComment & { taskId?: number }).taskId === taskId;
      });

      if (taskComments.length > 0) {
        setComments(taskComments);
      } else if (taskId === 1) {
        const sampleComment: TaskComment & { taskId: number } = {
          id: 1,
          taskId: 1,
          author: CURRENT_USER,
          message: "Test comment: The login page design is under review.",
          createdAt: new Date().toISOString(),
        };
        const otherComments = saved.filter(
          (comment) => (comment as TaskComment & { taskId?: number }).taskId !== taskId
        );
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify([...otherComments, sampleComment])
        );
        setComments([sampleComment]);
      }
    } catch {
      setComments([]);
    } finally {
      setIsLoaded(true);
    }
  }, [taskId]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || !isLoaded) return;

    const newComment: TaskComment & { taskId: number } = {
      id: Date.now(),
      taskId,
      author: CURRENT_USER,
      message: trimmedMessage,
      createdAt: new Date().toISOString(),
    };
    const nextComments = [...comments, newComment];
    setComments(nextComments);
    setMessage("");

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const saved: Array<TaskComment & { taskId?: number }> = raw ? JSON.parse(raw) : [];
      const otherComments = saved.filter((comment) => comment.taskId !== taskId);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...otherComments, ...nextComments]));
    } catch {
      // Keep the comment visible for the current session if storage is unavailable.
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
            <article key={comment.id} className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-slate-200">{comment.author}</span>
                <time className="text-xs text-slate-500">
                  {new Date(comment.createdAt).toLocaleString()}
                </time>
              </div>
              <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-400">
                {comment.message}
              </p>
            </article>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <label htmlFor={`task-comment-${taskId}`} className="block text-sm font-medium text-slate-300">
          Add a comment
        </label>
        <textarea
          id={`task-comment-${taskId}`}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={3}
          maxLength={3000}
          placeholder="Write your comment..."
          className="w-full resize-y rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-slate-600"
        />
        <div className="flex justify-end">
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
    </section>
  );
}
