"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type EventDetail = {
  id: number;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  max_capacity: number;
  available_spots: number;
  category?: string;
  image?: string;
  organizer_first_name?: string;
  organizer_last_name?: string;
};

const dateFormatter = new Intl.DateTimeFormat("ro-RO", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function EventDetailPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Încearcă GET /api/events/:id (când backend-ul îl va implementa)
      const res = await fetch(`${API_URL}/api/events/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data.event);
        return;
      }
      // Fallback: ia lista completă și filtrează după ID
      const listRes = await fetch(`${API_URL}/api/events`);
      if (!listRes.ok) throw new Error("Nu am putut încărca evenimentul.");
      const listData = await listRes.json();
      const found = (listData.events as EventDetail[]).find(
        (e) => String(e.id) === eventId,
      );
      if (!found) throw new Error("Evenimentul nu a fost găsit.");
      setEvent(found);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Eroare la încărcarea evenimentului.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void fetchEvent();
  }, [fetchEvent]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-100 px-4">
        <p className="text-red-600">{error ?? "Evenimentul nu a fost găsit."}</p>
        <Link
          href="/event-catalog"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          ← Înapoi la catalog
        </Link>
      </div>
    );
  }

  const isFull = event.available_spots <= 0;

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/event-catalog"
          className="mb-6 inline-block text-sm text-blue-600 hover:underline"
        >
          ← Înapoi la catalog
        </Link>

        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          {event.image && (
            <div className="mb-6 aspect-video overflow-hidden rounded-xl">
              <img
                src={event.image}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {event.category && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
              {event.category}
            </p>
          )}

          <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>

          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <p>
              <span className="font-medium">📅 Data:</span>{" "}
              {dateFormatter.format(new Date(event.event_date))}
              {event.event_time && ` la ${event.event_time.slice(0, 5)}`}
            </p>
            <p>
              <span className="font-medium">📍 Locație:</span> {event.location}
            </p>
            <p>
              <span className="font-medium">👥 Locuri disponibile:</span>{" "}
              <span
                className={
                  isFull
                    ? "font-semibold text-red-600"
                    : "font-semibold text-green-700"
                }
              >
                {isFull
                  ? "Sold Out"
                  : `${event.available_spots} / ${event.max_capacity}`}
              </span>
            </p>
            {(event.organizer_first_name || event.organizer_last_name) && (
              <p>
                <span className="font-medium">🎤 Organizator:</span>{" "}
                {[event.organizer_first_name, event.organizer_last_name]
                  .filter(Boolean)
                  .join(" ")}
              </p>
            )}
          </div>

          <div className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Descriere
            </h2>
            <p className="mt-2 leading-7 text-gray-700">{event.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
