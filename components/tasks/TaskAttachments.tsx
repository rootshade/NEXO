"use client";

import { useState } from "react";
import {
  Paperclip,
  Upload,
  X,
  FileText,
  Image as ImageIcon,
  Mic,
} from "lucide-react";

type AttachmentType =
  | "image"
  | "audio"
  | "file";

type Attachment = {
  id: number;
  name: string;
  type: AttachmentType;
  size: string;
};

function getAttachmentIcon(type: AttachmentType) {
  switch (type) {
    case "image":
      return <ImageIcon size={18} />;

    case "audio":
      return <Mic size={18} />;

    case "file":
      return <FileText size={18} />;
  }
}

export default function TaskAttachments() {
  const [attachments, setAttachments] =
    useState<Attachment[]>([]);

  const [showUpload, setShowUpload] =
    useState(false);

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    let type: AttachmentType = "file";

    if (file.type.startsWith("image/")) {
      type = "image";
    } else if (file.type.startsWith("audio/")) {
      type = "audio";
    }

    const newAttachment: Attachment = {
      id: Date.now(),
      name: file.name,
      type,
      size: `${(
        file.size /
        1024 /
        1024
      ).toFixed(2)} MB`,
    };

    setAttachments((current) => [
      ...current,
      newAttachment,
    ]);

    setShowUpload(false);
  }

  function handleRemove(id: number) {
    setAttachments((current) =>
      current.filter(
        (attachment) =>
          attachment.id !== id
      )
    );
  }

  return (
    <div className="mt-8 border-t border-slate-800 pt-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Paperclip
              size={18}
              className="text-slate-400"
            />

            <h2 className="text-sm font-semibold text-white">
              Attachments
            </h2>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Add images, audio files, or documents to this task.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowUpload(!showUpload)
          }
          className="
            flex w-fit
            items-center gap-2
            rounded-xl
            border border-slate-800
            px-4 py-2.5
            text-sm font-medium
            text-slate-300
            transition-colors
            hover:bg-slate-800
            hover:text-white
          "
        >
          <Upload size={16} />
          Add Attachment
        </button>
      </div>

      {/* Upload */}
      {showUpload && (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-6">
          <label
            className="
              flex
              cursor-pointer
              flex-col
              items-center
              justify-center
              rounded-xl
              px-4 py-8
              text-center
              transition-colors
              hover:bg-slate-900
            "
          >
            <Upload
              size={24}
              className="text-slate-500"
            />

            <span className="mt-3 text-sm font-medium text-slate-300">
              Choose a file
            </span>

            <span className="mt-1 text-xs text-slate-600">
              Images, audio and documents
            </span>

            <input
              type="file"
              className="hidden"
              accept="image/*,audio/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
            />
          </label>
        </div>
      )}

      {/* Attachment List */}
      <div className="mt-5 space-y-3">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="
              flex
              items-center
              justify-between
              gap-4
              rounded-xl
              border border-slate-800
              bg-slate-900
              px-4 py-3
            "
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className="
                  flex size-9
                  shrink-0
                  items-center justify-center
                  rounded-lg
                  bg-slate-800
                  text-slate-400
                "
              >
                {getAttachmentIcon(
                  attachment.type
                )}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {attachment.name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {attachment.size}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                handleRemove(attachment.id)
              }
              className="
                flex size-8
                shrink-0
                items-center justify-center
                rounded-lg
                text-slate-500
                transition-colors
                hover:bg-red-500/10
                hover:text-red-400
              "
              aria-label="Remove attachment"
            >
              <X size={17} />
            </button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {attachments.length === 0 &&
        !showUpload && (
          <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-8 text-center">
            <p className="text-sm text-slate-500">
              No attachments yet.
            </p>
          </div>
        )}
    </div>
  );
}