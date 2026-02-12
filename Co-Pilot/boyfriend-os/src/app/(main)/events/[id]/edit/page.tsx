import { getEvent } from "@/features/events/actions";
import { EditEventForm } from "./edit-event-form";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const event = await getEvent(id);

  return <EditEventForm event={event} />;
}
