"use client";

const COMMENTS_STORAGE_KEY = "nexo_task_comments";
const ATTACHMENTS_DATABASE_NAME = "nexo-task-attachments";
const ATTACHMENTS_STORE_NAME = "attachments";

function removeTaskComments(taskId: number): void {
  try {
    const raw = window.localStorage.getItem(COMMENTS_STORAGE_KEY);
    if (!raw) return;

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;

    const remaining = parsed.filter(
      (comment) =>
        !comment ||
        typeof comment !== "object" ||
        (comment as { taskId?: unknown }).taskId !== taskId
    );

    window.localStorage.setItem(
      COMMENTS_STORAGE_KEY,
      JSON.stringify(remaining)
    );
  } catch (error) {
    console.error("Unable to clean up task comments:", error);
  }
}

function removeTaskAttachments(taskId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      resolve();
      return;
    }

    const request = window.indexedDB.open(ATTACHMENTS_DATABASE_NAME);

    request.onerror = () => {
      reject(request.error ?? new Error("Unable to open attachment storage."));
    };

    request.onsuccess = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(ATTACHMENTS_STORE_NAME)) {
        database.close();
        resolve();
        return;
      }

      const transaction = database.transaction(
        ATTACHMENTS_STORE_NAME,
        "readwrite"
      );
      const store = transaction.objectStore(ATTACHMENTS_STORE_NAME);

      if (!store.indexNames.contains("taskId")) {
        database.close();
        resolve();
        return;
      }

      const cursorRequest = store
        .index("taskId")
        .openCursor(IDBKeyRange.only(taskId));

      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      cursorRequest.onerror = () => {
        transaction.abort();
      };

      transaction.oncomplete = () => {
        database.close();
        resolve();
      };

      transaction.onerror = () => {
        database.close();
        reject(transaction.error ?? new Error("Unable to delete task attachments."));
      };

      transaction.onabort = () => {
        database.close();
        reject(transaction.error ?? new Error("Task attachment cleanup was cancelled."));
      };
    };
  });
}

/**
 * Remove browser-local comments and attachment files belonging to a deleted task.
 * Activity records are intentionally retained as a lightweight history.
 */
export async function cleanupTaskData(taskId: number): Promise<void> {
  if (typeof window === "undefined") return;

  removeTaskComments(taskId);

  try {
    await removeTaskAttachments(taskId);
  } catch (error) {
    // A cleanup failure should not undo a task deletion.
    console.error("Unable to clean up task attachments:", error);
  }
}
