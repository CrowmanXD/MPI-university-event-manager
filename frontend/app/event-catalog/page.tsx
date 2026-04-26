"use client";

import { useMemo, useState } from "react";

type EventCategory = "Workshop" | "Party" | "Seminar";
type EventTab = "upcoming" | "history";
type CategoryFilter = "Toate" | EventCategory;

type EventItem = {
  id: number;
  title: string;
  date: string;
  location: string;
  image: string;
  category: EventCategory;
};

const MOCK_EVENTS: EventItem[] = [
  {
    id: 1,
    title: "Workshop React Avansat",
    date: "2026-10-15T10:00:00.000Z",
    location: "Aula Magna, Cluj-Napoca",
    image: "https://images.unsplash.com/photo-1515169067868-5387ec356754?w=1200&q=80",
    category: "Workshop",
  },
  {
    id: 2,
    title: "Student Coding Party",
    date: "2026-06-20T18:30:00.000Z",
    location: "Campus Hub, Bucuresti",
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",
    category: "Party",
  },
  {
    id: 3,
    title: "Seminar Cybersecurity",
    date: "2025-11-05T09:00:00.000Z",
    location: "Sala Polivalenta, Iasi",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80",
    category: "Seminar",
  },
  {
    id: 4,
    title: "Workshop UI/UX Essentials",
    date: "2026-07-12T15:00:00.000Z",
    location: "Hub Innovate, Timisoara",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80",
    category: "Workshop",
  },
  {
    id: 5,
    title: "Alumni Networking Party",
    date: "2025-06-18T17:30:00.000Z",
    location: "Corpul B, Sibiu",
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&q=80",
    category: "Party",
  },
  {
    id: 6,
    title: "Seminar Career in Tech",
    date: "2026-09-02T09:30:00.000Z",
    location: "Centrul Expozitional, Brasov",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
    category: "Seminar",
  },
];

const dateFormatter = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function EventCatalogPage() {
  const [activeTab, setActiveTab] = useState<EventTab>("upcoming");
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("Toate");

  const filteredEvents = useMemo(() => {
    const now = new Date();

    const tabFiltered = MOCK_EVENTS.filter((event) => {
      const eventDate = new Date(event.date);
      return activeTab === "upcoming" ? eventDate > now : eventDate <= now;
    });

    const categoryFiltered = tabFiltered.filter((event) => {
      if (selectedCategory === "Toate") {
        return true;
      }
      return event.category === selectedCategory;
    });

    if (activeTab === "upcoming") {
      return categoryFiltered.sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      );
    }

    return categoryFiltered.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [activeTab, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Event Catalog</h1>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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

            <select
              value={selectedCategory}
              onChange={(event) =>
                setSelectedCategory(event.target.value as CategoryFilter)
              }
              className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              aria-label="Filtrare după categorie"
            >
              <option value="Toate">Toate</option>
              <option value="Workshop">Workshop</option>
              <option value="Party">Party</option>
              <option value="Seminar">Seminar</option>
            </select>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-gray-600 shadow-sm ring-1 ring-gray-200">
            Nu există evenimente pentru filtrele selectate.
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

                <div className="flex h-[240px] flex-col p-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                    {event.category}
                  </p>
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
