"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type EventCategory = "Workshop" | "Party" | "Seminar" | "Conferinta" | "Hackathon" | string;
type EventTab = "upcoming" | "history";
type CategoryFilter = "Toate" | EventCategory;

// Am actualizat tipul pentru a se potrivi cu ce trimite backend-ul (event_date, image, etc.)
type EventItem = {
  id: number;
  title: string;
  event_date: string;
  location: string;
  image: string;
  category: EventCategory;
};

const dateFormatter = new Intl.DateTimeFormat("ro-RO", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function EventCatalogPage() {
  const [activeTab, setActiveTab] = useState<EventTab>("upcoming");
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>("Toate");
  
  // Stările noi pentru datele reale de la server
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Funcția care aduce datele de la API
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_URL}/api/events`);
        if (!res.ok) {
          throw new Error("Nu am putut descărca lista de evenimente.");
        }
        const data = await res.json();
        setEvents(data.events || []);
      } catch (err) {
        setError("A apărut o eroare la conectarea cu serverul.");
      } finally {
        setIsLoading(false);
      }
    };

    void fetchEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const now = new Date();

    const tabFiltered = events.filter((event) => {
      const eventDate = new Date(event.event_date); // Folosim event_date de la backend
      return activeTab === "upcoming" ? eventDate >= now : eventDate < now;
    });

    const categoryFiltered = tabFiltered.filter((event) => {
      if (selectedCategory === "Toate") {
        return true;
      }
      return event.category === selectedCategory;
    });

    if (activeTab === "upcoming") {
      return categoryFiltered.sort(
        (a, b) => new Date(a.event_date).getTime() - new Date(b.event_date).getTime(),
      );
    }

    return categoryFiltered.sort(
      (a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime(),
    );
  }, [activeTab, selectedCategory, events]); // Acum filtrul depinde de 'events'

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Catalog Evenimente</h1>

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
              <option value="Conferinta">Conferință</option>
              <option value="Hackathon">Hackathon</option>
            </select>
          </div>
        </div>

        {/* Gestionează starea de încărcare și erorile */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
          </div>
        ) : error ? (
          <div className="rounded-xl bg-red-50 p-8 text-center text-red-600 ring-1 ring-red-200">
            {error}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-gray-600 shadow-sm ring-1 ring-gray-200">
            Nu există evenimente pentru filtrele selectate.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <article
                key={event.id}
                className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200 transition duration-300 hover:scale-105 hover:shadow-lg"
              >
                <div className="aspect-video overflow-hidden bg-gray-200">
                  <img
                    src={event.image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80"}
                    alt={event.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // Fallback dacă link-ul imaginii din DB este stricat
                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80";
                    }}
                  />
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                    {event.category}
                  </p>
                  <h2 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {event.title}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-blue-700">
                    {dateFormatter.format(new Date(event.event_date))}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-1">{event.location}</p>

                  <Link
                    href={`/event-catalog/${event.id}`}
                    className="mt-4 inline-flex w-fit rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Detalii
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}