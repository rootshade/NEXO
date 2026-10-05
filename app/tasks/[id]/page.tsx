import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Image,
  Mic,
  User,
} from "lucide-react";

import TaskDetailsContent from "@/components/tasks/TaskDetailsContent";

type TaskDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function TaskDetailsPage({
  params,
}: TaskDetailsPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <Link
        href="/tasks"
        className="
          inline-flex items-center gap-2
          text-sm text-slate-400
          transition-colors
          hover:text-white
        "
      >
        <ArrowLeft size={17} />
        Back to Tasks
      </Link>

      <TaskDetailsContent taskId={id} />
    </div>
  );
}