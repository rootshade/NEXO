"use client";

import { useState } from "react";

type DeleteTaskButtonProps = {
  taskTitle: string;
};

export default function DeleteTaskButton({
  taskTitle,
}: DeleteTaskButtonProps) {
  const [showModal, setShowModal] =
    useState(false);

  const [deleted, setDeleted] =
    useState(false);

  function handleDelete() {
    setDeleted(true);
    setShowModal(false);
  }

  if (deleted) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
        Task deleted successfully.
      </div>
    );
  }

  return (
    <>
      {/* Delete Button */}
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="
          rounded-xl
          border border-red-500/20
          px-4 py-2.5
          text-sm font-medium
          text-red-400
          transition-colors
          hover:bg-red-500/10
        "
      >
        Delete Task
      </button>

      {/* Confirmation Modal */}
      {showModal && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/70
            p-4
            backdrop-blur-sm
          "
          onClick={() => setShowModal(false)}
        >
          <div
            className="
              w-full max-w-md
              rounded-2xl
              border border-slate-800
              bg-slate-900
              p-6
              shadow-2xl
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <h2 className="text-lg font-semibold text-white">
              Delete Task?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Are you sure you want to delete{" "}
              <span className="font-medium text-white">
                "{taskTitle}"
              </span>
              ?
              <br />
              This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setShowModal(false)
                }
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
                onClick={handleDelete}
                className="
                  rounded-xl
                  bg-red-500
                  px-5 py-2.5
                  text-sm font-semibold
                  text-white
                  transition-colors
                  hover:bg-red-600
                "
              >
                Delete Task
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}