export type MessageStatus = "Unread" | "Read";

export type MessageAttachment = { id: string; name: string; type: string; size: number; dataUrl: string; };

export type Message = {
  id: number;
  sender: string;
  receiver: string;
  /** Stable participant IDs for newly created correspondence. */
  senderId?: string;
  receiverId?: string;
  subject: string;
  content: string;
  date: string;
  status: MessageStatus;
  attachments?: MessageAttachment[];
};

export const initialMessages: Message[] = [
  {
    id: 1,
    sender: "Ali Ahmadi",
    receiver: "Mohammad",
    subject: "Network Configuration",
    content:
      "The new branch network configuration has been completed successfully. Please review the router settings.",
    date: "2026-10-05 14:30",
    status: "Unread",
  },
  {
    id: 2,
    sender: "Security Team",
    receiver: "Mohammad",
    subject: "Security Alert",
    content:
      "A security configuration issue was detected and requires your attention.",
    date: "2026-10-04 11:20",
    status: "Unread",
  },
  {
    id: 3,
    sender: "Mohammad",
    receiver: "Ali Ahmadi",
    subject: "Project Update",
    content:
      "The NEXO frontend development is progressing according to the current development plan.",
    date: "2026-10-03 16:45",
    status: "Read",
  },
  {
    id: 4,
    sender: "IT Department",
    receiver: "Mohammad",
    subject: "Server Maintenance",
    content:
      "The scheduled server maintenance will begin tomorrow at 22:00.",
    date: "2026-10-02 09:15",
    status: "Read",
  },
];