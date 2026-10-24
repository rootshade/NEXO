"use client";

import { useState } from "react";
import { FileText, Image as ImageIcon, Paperclip, Pencil, Save, X } from "lucide-react";

export type CorrespondenceAttachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  dataUrl: string;
};

type CorrespondenceEditorProps = {
  kind: "Message" | "Letter";
  content: string;
  attachments?: CorrespondenceAttachment[];
  onSave: (content: string, attachments: CorrespondenceAttachment[]) => void;
};

const fieldClass = "w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400";

export default function CorrespondenceEditor({ kind, content, attachments = [], onSave }: CorrespondenceEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const [draftAttachments, setDraftAttachments] = useState(attachments);
  const [error, setError] = useState("");

  function startEditing() {
    setDraft(content);
    setDraftAttachments(attachments);
    setError("");
    setEditing(true);
  }

  async function handleFiles(files: FileList | null) {
    if (!files) return;
    setError("");
    const selected = Array.from(files);
    if (selected.some((file) => file.size > 2 * 1024 * 1024)) {
      setError("Each file must be 2 MB or smaller.");
      return;
    }
    try {
      const added = await Promise.all(selected.map((file) => new Promise<CorrespondenceAttachment>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
          dataUrl: String(reader.result),
        });
        reader.onerror = () => reject(new Error("Could not read a selected file."));
        reader.readAsDataURL(file);
      })));
      setDraftAttachments((current) => [...current, ...added]);
    } catch {
      setError("A file could not be read. Please try again.");
    }
  }

  function save() {
    if (!draft.trim()) {
      setError("The content cannot be empty.");
      return;
    }
    try {
      onSave(draft.trim(), draftAttachments);
      setEditing(false);
      setError("");
    } catch {
      setError("Could not save changes. Try removing a large attachment.");
    }
  }

  return (
    <section className="rounded-2xl border border-indigo-400/15 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/20 p-5 shadow-xl shadow-black/10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-white">{kind} content</h2>
          <p className="mt-1 text-xs text-slate-500">The sender and recipient can edit this shared content.</p>
        </div>
        {!editing && <button type="button" onClick={startEditing} className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-sm text-slate-200 transition hover:border-cyan-400/40 hover:bg-cyan-400/5"><Pencil size={15} /> Edit content</button>}
      </div>

      {editing ? (
        <div className="space-y-4">
          <label className="block text-sm text-slate-300">
            Text
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={7} maxLength={20000} className={`${fieldClass} mt-2 resize-y leading-7`} />
          </label>
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-cyan-200 hover:text-cyan-100">
              <Paperclip size={17} /> Attach text, file, or image (max 2 MB each)
              <input type="file" multiple accept=".txt,.md,.pdf,.doc,.docx,.csv,.png,.jpg,.jpeg,.webp,.gif,image/*,text/*,application/pdf" className="sr-only" onChange={(event) => { void handleFiles(event.target.files); event.currentTarget.value = ""; }} />
            </label>
            <p className="mt-2 text-xs text-slate-500">Files are stored in this browser for this prototype.</p>
          </div>
          {draftAttachments.length > 0 && <ul className="space-y-2">
            {draftAttachments.map((file) => <li key={file.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
              <span className="flex min-w-0 items-center gap-2 text-sm text-slate-300"><FileText size={16} className="shrink-0 text-cyan-300" /><span className="truncate">{file.name}</span><span className="shrink-0 text-xs text-slate-500">{Math.max(1, Math.round(file.size / 1024))} KB</span></span>
              <button type="button" onClick={() => setDraftAttachments((current) => current.filter((item) => item.id !== file.id))} className="rounded-lg p-1.5 text-slate-500 hover:bg-red-500/10 hover:text-red-300" aria-label={`Remove ${file.name}`}><X size={16} /></button>
            </li>)}
          </ul>}
          {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
          <div className="flex flex-wrap justify-end gap-2">
            <button type="button" onClick={() => { setEditing(false); setError(""); }} className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800">Cancel</button>
            <button type="button" onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-200"><Save size={16} /> Save changes</button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">{content}</p>
          </div>
          {attachments.length > 0 && <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-300"><Paperclip size={15} /> Attachments ({attachments.length})</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {attachments.map((file) => <div key={file.id} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                {file.type.startsWith("image/") ? <a href={file.dataUrl} target="_blank" rel="noreferrer" className="mb-3 block"><img src={file.dataUrl} alt={file.name} className="max-h-56 w-full rounded-lg object-contain" /></a> : null}
                <div className="flex items-center gap-2">
                  {file.type.startsWith("image/") ? <ImageIcon size={17} className="shrink-0 text-cyan-300" /> : <FileText size={17} className="shrink-0 text-cyan-300" />}
                  <span className="min-w-0 flex-1 truncate text-sm text-slate-300">{file.name}</span>
                  <a href={file.dataUrl} download={file.name} className="text-xs font-medium text-cyan-200 hover:text-cyan-100">Download</a>
                </div>
              </div>)}
            </div>
          </div>}
        </div>
      )}
    </section>
  );
}
