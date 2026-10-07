export type LetterStatus =
  | "Unread"
  | "Read"
  | "Sent";

export type Letter = {
  id: number;
  subject: string;
  sender: string;
  receiver: string;
  date: string;
  status: LetterStatus;
  content: string;
};

export const initialLetters: Letter[] = [
  {
    id: 1,
    subject: "Network Infrastructure Update",
    sender: "Ali Ahmadi",
    receiver: "Mohammad",
    date: "2026-10-05",
    status: "Unread",
    content:
      "The network infrastructure has been updated successfully. Please review the latest configuration and report any issues.",
  },
  {
    id: 2,
    subject: "Security Review Report",
    sender: "Security Team",
    receiver: "Mohammad",
    date: "2026-10-04",
    status: "Read",
    content:
      "The security review has been completed. Several configuration improvements were identified and should be reviewed by the technical team.",
  },
  {
    id: 3,
    subject: "Project Meeting",
    sender: "Mohammad",
    receiver: "Ali Ahmadi",
    date: "2026-10-03",
    status: "Sent",
    content:
      "Please attend the project meeting to discuss the current development progress and the next implementation steps.",
  },
  {
    id: 4,
    subject: "Server Maintenance",
    sender: "IT Department",
    receiver: "Mohammad",
    date: "2026-10-02",
    status: "Unread",
    content:
      "Scheduled server maintenance will be performed. Please make sure all important tasks are completed before the maintenance window.",
  },
];