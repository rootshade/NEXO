"use client";

export type TaskAttachmentType = "image" | "audio" | "file";

export type TaskAttachment = {
  id: string;
  taskId: number;
  name: string;
  type: TaskAttachmentType;
  size: number;
  mimeType: string;
  createdAt: string;
};

type StoredTaskAttachment = TaskAttachment & { blob: Blob };

const DATABASE_NAME = "nexo-task-attachments";
const DATABASE_VERSION = 1;
const STORE_NAME = "attachments";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      reject(new Error("This browser does not support local file storage."));
      return;
    }

    const request = window.indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("taskId", "taskId", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open attachment storage."));
  });
}

export async function getTaskAttachments(taskId: number): Promise<TaskAttachment[]> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).index("taskId").getAll(IDBKeyRange.only(taskId));

    request.onsuccess = () => {
      const records = request.result as StoredTaskAttachment[];
      resolve(
        records
          .map((record): TaskAttachment => ({
            id: record.id,
            taskId: record.taskId,
            name: record.name,
            type: record.type,
            size: record.size,
            mimeType: record.mimeType,
            createdAt: record.createdAt,
          }))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      );
    };
    request.onerror = () => reject(request.error ?? new Error("Could not load attachments."));
    transaction.oncomplete = () => database.close();
  });
}

export async function saveTaskAttachment(
  taskId: number,
  file: File
): Promise<TaskAttachment> {
  const database = await openDatabase();

  const type: TaskAttachmentType = file.type.startsWith("image/")
    ? "image"
    : file.type.startsWith("audio/")
      ? "audio"
      : "file";

  const attachment: StoredTaskAttachment = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    taskId,
    name: file.name,
    type,
    size: file.size,
    mimeType: file.type || "application/octet-stream",
    createdAt: new Date().toISOString(),
    blob: file,
  };

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(attachment);
    transaction.oncomplete = () => {
      database.close();
      resolve({
        id: attachment.id,
        taskId: attachment.taskId,
        name: attachment.name,
        type: attachment.type,
        size: attachment.size,
        mimeType: attachment.mimeType,
        createdAt: attachment.createdAt,
      });
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error("Could not save attachment."));
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error("Attachment save was cancelled."));
    };
  });
}

export async function getTaskAttachmentFile(id: string): Promise<{ name: string; mimeType: string; blob: Blob } | undefined> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(id);

    request.onsuccess = () => {
      const record = request.result as StoredTaskAttachment | undefined;
      resolve(record ? { name: record.name, mimeType: record.mimeType, blob: record.blob } : undefined);
    };
    request.onerror = () => reject(request.error ?? new Error("Could not read attachment."));
    transaction.oncomplete = () => database.close();
  });
}

export async function deleteTaskAttachment(id: string): Promise<void> {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(id);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error ?? new Error("Could not delete attachment."));
    };
  });
}
