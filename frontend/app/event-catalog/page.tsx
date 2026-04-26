"use client";

import { useMemo, useState } from "react";

type EventItem = {
  id: number;
  title: string;
  date: string;
  location: string;
  image: string;
};

type ActiveTab = "upcoming" | "history";

const MOCK_EVENTS: EventItem[] = [
  {
    id: 1,
    title: "Hackathon AI Campus",
    date: "2026-10-15T10:00:00.000Z",
    location: "Aula Magna, Cluj-Napoca",
    image: "https://images.unsplash.com/photo-1515169067868-5387ec356754?w=1200&q=80",
  },
  {
    id: 2,
    title: "Workshop Web Security",
    date: "2026-05-20T08:30:00.000Z",
    location: "Laborator C12, Bucuresti",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80",
  },
  {
    id: 3,
    title: "Conferinta Tech Trends",
    date: "2025-11-05T09:00:00.000Z",
    location: "Sala Polivalenta, Iasi",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
  },
  {
    id: 4,
    title: "Meetup DevOps Student",
    date: "2026-07-12T15:00:00.000Z",
    location: "Hub Innovate, Timisoara",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80",
  },
  {
    id: 5,
    title: "Seminar UX Design Essentials",
    date: "2025-06-18T11:30:00.000Z",
    location: "Corpul B, Sibiu",
    image: "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=1200&q=80",
  },
  {
    id: 6,
    title: "Career Fair IT & Software",
    date: "2026-09-02T09:30:00.000Z",
    location: "Centrul Expozitional, Brasov",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80",
  },
];

const dateFormatter = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function EventCatalogPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("upcoming");

  const filteredEvents = useMemo(() => {
    const now = new Date();
    const isUpcoming = (event: EventItem) => new Date(event.date) > now;
    const isHistory = (event: EventItem) => new Date(event.date) <= now;

    if (activeTab === "upcoming") {
      return [...MOCK_EVENTS]
        .filter(isUpcoming)
        .sort(
          (a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
    }

    return [...MOCK_EVENTS]
      .filter(isHistory)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Event Catalog</h1>
          <div className="inline-flex rounded-lg bg-white p-1 shadow-sm ring-1 ring-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab("upcoming")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                activeTab === "upcoming"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Evenimente Viitoare
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                activeTab === "history"
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Istoric
            </button>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-gray-600 shadow-sm ring-1 ring-gray-200">
            Nu există evenimente pentru această secțiune.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <article
                key={event.id}
                className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition duration-300 hover:scale-105 hover:shadow-lg"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div className="flex h-[220px] flex-col p-5">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {event.title}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-blue-700">
                    {dateFormatter.format(new Date(event.date))}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">{event.location}</p>

                  <button
                    type="button"
                    className="mt-auto inline-flex w-fit rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Detalii
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
