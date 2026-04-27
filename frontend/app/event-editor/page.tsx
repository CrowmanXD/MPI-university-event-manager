"use client";

import { FormEvent, useMemo, useState } from "react";

type EventData = {
  title: string;
  date: string;
  location: string;
  description: string;
};

const originalEvent: EventData = {
  title: "Innovation Day 2026",
  date: "2026-10-15T09:00",
  location: "Aula Magna, Cluj-Napoca",
  description:
    "Eveniment dedicat studentilor pasionati de tehnologie, cu sesiuni de networking si prezentari despre trendurile din industrie.",
};

const formatDisplayDate = (value: string) => {
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsedDate);
};

export default function EventEditorPage() {
  const [currentEvent, setCurrentEvent] = useState<EventData>(originalEvent);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<EventData>(currentEvent);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const locationUpdated = useMemo(
    () => currentEvent.location !== originalEvent.location,
    [currentEvent.location],
  );

  const dateUpdated = useMemo(
    () => currentEvent.date !== originalEvent.date,
    [currentEvent.date],
  );

  const handleStartEditing = () => {
    setFormData(currentEvent);
    setSubmitError("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData(currentEvent);
    setSubmitError("");
    setIsEditing(false);
  };

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");
    setIsSaving(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 900));

      await fetch("/api/events/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      setCurrentEvent(formData);
      setIsEditing(false);
    } catch {
      setSubmitError("Modificarile nu au putut fi salvate. Incearca din nou.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            Vizualizare si Editare Eveniment
          </h1>

          {!isEditing ? (
            <div className="mt-6 space-y-5">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Titlu
                </p>
                <p className="mt-1 text-lg font-semibold text-gray-900">
                  {currentEvent.title}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Data
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <p
                    className={`text-base ${
                      dateUpdated ? "font-semibold text-orange-700" : "text-gray-800"
                    }`}
                  >
                    {formatDisplayDate(currentEvent.date)}
                  </p>
                  {dateUpdated && (
                    <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                      Program Modificat
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Locatie
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <p
                    className={`text-base ${
                      locationUpdated
                        ? "font-semibold text-orange-700"
                        : "text-gray-800"
                    }`}
                  >
                    {currentEvent.location}
                  </p>
                  {locationUpdated && (
                    <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
                      Locatie Actualizata
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  Descriere
                </p>
                <p className="mt-1 leading-7 text-gray-700">
                  {currentEvent.description}
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartEditing}
                className="mt-2 inline-flex rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Editeaza Eveniment
              </button>
            </div>
          ) : (
            <form onSubmit={handleSave} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Titlu
                </label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Data
                </label>
                <input
                  id="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label
                  htmlFor="location"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Locatie
                </label>
                <input
                  id="location"
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Descriere
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={5}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {submitError && (
                <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {submitError}
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {isSaving ? "Se salveaza..." : "Salveaza"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="inline-flex rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Anuleaza
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
