"use client";

import { useCallback, useEffect, useState } from "react";
import { authHeaders } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type EventSummary = {
  id: number;
  title: string;
  event_date: string;
  event_time?: string;
};

type Attendee = {
  first_name: string;
  last_name: string;
  email: string;
};

export default function EventAttendanceDashboardPage() {
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [maxCapacity, setMaxCapacity] = useState<number>(0);
  const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);
  const [attendeesError, setAttendeesError] = useState<string | null>(null);

  // Încarcă lista de evenimente pentru dropdown
  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/events`);
      if (!res.ok) return;
      const data = await res.json();
      setEvents(data.events ?? []);
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  // La selectarea unui eveniment, încarcă participanții
  const fetchAttendees = useCallback(async (eventId: string) => {
    setIsLoadingAttendees(true);
    setAttendeesError(null);
    setAttendees([]);
    setMaxCapacity(0);
    try {
      const res = await fetch(`${API_URL}/api/events/${eventId}/attendees`, {
        headers: authHeaders(),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          (data as { error?: string }).error ??
            "Nu am putut încărca participanții.",
        );
      }
      const data = await res.json();
      setAttendees(data.attendees ?? []);
      if (data.max_capacity) setMaxCapacity(data.max_capacity as number);
    } catch (err) {
      setAttendeesError(
        err instanceof Error
          ? err.message
          : "Eroare la încărcarea participanților.",
      );
    } finally {
      setIsLoadingAttendees(false);
    }
  }, []);

  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId);
    if (eventId) {
      void fetchAttendees(eventId);
    } else {
      setAttendees([]);
      setAttendeesError(null);
    }
  };

  const progressPercent =
    maxCapacity > 0
      ? Math.min((attendees.length / maxCapacity) * 100, 100)
      : 0;

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">

        {/* Card cu selectorul de eveniment */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">
            Event Attendance Dashboard
          </h1>

          <div className="mt-4">
            <label
              htmlFor="event-select"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Selectează evenimentul
            </label>
            {isLoadingEvents ? (
              <p className="text-sm text-gray-500">Se încarcă evenimentele...</p>
            ) : (
              <select
                id="event-select"
                value={selectedEventId}
                onChange={(e) => handleEventChange(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 sm:max-w-sm"
              >
                <option value="">-- Selectează un eveniment... --</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.title} (
                    {new Date(event.event_date).toLocaleDateString("ro-RO")})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Progress bar — apare doar după ce s-au încărcat participanți */}
          {selectedEventId && !isLoadingAttendees && !attendeesError && attendees.length > 0 && (
            <>
              <p className="mt-4 text-sm text-gray-600">
                Studenți înscriși:{" "}
                <span className="font-semibold text-blue-700">
                  {attendees.length}
                  {maxCapacity > 0 ? ` / ${maxCapacity}` : ""}
                </span>
                {maxCapacity > 0 && " (Capacitate maximă)"}
              </p>
              {maxCapacity > 0 && (
                <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={maxCapacity}
                    aria-valuenow={attendees.length}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Tabel participanți */}
        {!selectedEventId ? (
          <div className="rounded-xl bg-white p-8 text-center text-gray-500 shadow-sm ring-1 ring-gray-200">
            Selectează un eveniment din dropdown pentru a vedea participanții.
          </div>
        ) : isLoadingAttendees ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-xl bg-white shadow-sm">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          </div>
        ) : attendeesError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <p className="text-red-700">{attendeesError}</p>
            <button
              type="button"
              onClick={() => void fetchAttendees(selectedEventId)}
              className="mt-3 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Reîncearcă
            </button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-gray-700">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Prenume</th>
                    <th className="px-6 py-4 font-semibold">Nume</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        Niciun student înscris încă.
                      </td>
                    </tr>
                  ) : (
                    attendees.map((attendee, idx) => (
                      <tr
                        key={`${attendee.email}-${idx}`}
                        className="border-t border-gray-100 transition hover:bg-blue-50/40"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {attendee.first_name || "—"}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {attendee.last_name || "—"}
                        </td>
                        <td className="px-6 py-4">{attendee.email}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
