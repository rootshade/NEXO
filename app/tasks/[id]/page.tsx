
import TaskDetailsClient from "./TaskDetailsClient";

export default async function TaskDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <TaskDetailsClient
      id={Number(id)}
    />
  );
}
