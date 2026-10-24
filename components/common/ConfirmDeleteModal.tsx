"use client";

import { AlertTriangle, LoaderCircle, Trash2, X } from "lucide-react";
import { useEffect } from "react";

type ConfirmDeleteModalProps = {
  open: boolean;
  title?: string;
  description: string;
  itemName?: string;
  error?: string;
  isDeleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDeleteModal({
  open,
  title = "Confirm deletion",
  description,
  itemName,
  error = "",
  isDeleting = false,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) {
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isDeleting) onCancel();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, isDeleting, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isDeleting) onCancel();
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="nexo-delete-title"
        aria-describedby="nexo-delete-description"
        className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl shadow-black/40"
      >
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
            <AlertTriangle size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 id="nexo-delete-title" className="text-base font-semibold text-white">{title}</h3>
            <p id="nexo-delete-description" className="mt-2 text-sm leading-6 text-slate-300">
              {description} {itemName ? <span className="break-words font-medium text-white">{itemName}</span> : null}
            </p>
          </div>
          <button type="button" onClick={onCancel} disabled={isDeleting} aria-label="Close dialog" className="rounded-lg p-1 text-slate-500 hover:bg-slate-800 hover:text-white disabled:opacity-50">
            <X size={18} />
          </button>
        </div>
        {error && <p role="alert" className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" disabled={isDeleting} onClick={onCancel} className="rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 disabled:opacity-50">Cancel</button>
          <button type="button" disabled={isDeleting} onClick={onConfirm} className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60">
            {isDeleting ? <LoaderCircle size={16} className="animate-spin" /> : <Trash2 size={16} />}
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
