import type { AccessUser } from "./accessControl";

type CorrespondenceRecord = {
  sender: string;
  receiver: string;
  senderId?: string;
  receiverId?: string;
};

export function canViewCorrespondenceRecord(record: CorrespondenceRecord, user: AccessUser): boolean;
export function isCorrespondenceRecipientRecord(record: CorrespondenceRecord, user: AccessUser): boolean;
export function isCorrespondenceSenderRecord(record: CorrespondenceRecord, user: AccessUser): boolean;
