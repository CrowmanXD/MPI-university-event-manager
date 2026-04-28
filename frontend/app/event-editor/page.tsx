"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authHeaders, isLoggedIn } from "@/lib/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

type CreateEventForm = {
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  max_capacity: string;
  category: string;
  image_url: string;
};

const EMPTY_FORM: CreateEventForm = {
  title: "",
  description: "",
  event_date: "",
  event_time: "",
  location: "",
  max_capacity: "",
  category: "",
  image_url: "",
};

export default function EventEditorPage() {
  const router = useRouter();
  const [form, setForm] = useState<CreateEventForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const isFormValid =
    form.title.trim() &&
    form.description.trim() &&
    form.event_date &&
    form.event_time &&
    form.location.trim() &&
    form.max_capacity;

  const handleChange = (field: keyof CreateEventForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isLoggedIn()) {
      router.push("/login");
      return;
    }

    setSubmitError("");
    setIsSaving(true);

    try {
      const response = await fetch(`${API_URL}/api/events`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          event_date: form.event_date,
          event_time: form.event_time,
          location: form.location.trim(),
          max_capacity: Number(form.max_capacity),
          category: form.category,
          image_url: form.image_url.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(data.error || "Nu am putut crea evenimentul.");
        return;
      }

      setIsSuccess(true);
      setForm(EMPTY_FORM);
    } catch {
      setSubmitError(
        "Conexiune eșuată. Verifică că serverul rulează și încearcă din nou.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-blue-600 hover:underline"
        >
          ← Acasă
        </Link>

        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">
            Creare Eveniment Nou
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Completează detaliile pentru a publica un eveniment în catalog.
          </p>

          {isSuccess ? (
            <div className="mt-6 space-y-4">
              <p className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                Evenimentul a fost creat cu succes și este acum vizibil în
                catalog!
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/event-catalog"
                  className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Vezi Catalogul
                </Link>
                <button
                  type="button"
                  onClick={() => setIsSuccess(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Creează Alt Eveniment
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
              {/* Titlu */}
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Titlu *
                </label>
                <input
                  id="title"
                  type="text"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Ex: Workshop React Avansat"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* Data + Ora */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="event_date"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Data *
                  </label>
                  <input
                    id="event_date"
                    type="date"
                    value={form.event_date}
                    onChange={(e) => handleChange("event_date", e.target.value)}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
                <div>
                  <label
                    htmlFor="event_time"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Ora *
                  </label>
                  <input
                    id="event_time"
                    type="time"
                    value={form.event_time}
                    onChange={(e) => handleChange("event_time", e.target.value)}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              {/* Locatie */}
              <div>
                <label
                  htmlFor="location"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Locație *
                </label>
                <input
                  id="location"
                  type="text"
                  value={form.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="Ex: Aula Magna, Cluj-Napoca"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* Categorie + Capacitate */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Categorie
                  </label>
                  <select
                    id="category"
                    value={form.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">-- Alege --</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Party">Party</option>
                    <option value="Conferinta">Conferință</option>
                    <option value="Hackathon">Hackathon</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="max_capacity"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Capacitate maximă *
                  </label>
                  <input
                    id="max_capacity"
                    type="number"
                    min="1"
                    value={form.max_capacity}
                    onChange={(e) =>
                      handleChange("max_capacity", e.target.value)
                    }
                    placeholder="Ex: 50"
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              {/* URL Imagine */}
              <div>
                <label
                  htmlFor="image_url"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  URL Imagine (opțional)
                </label>
                <input
                  id="image_url"
                  type="url"
                  value={form.image_url}
                  onChange={(e) => handleChange("image_url", e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {/* Descriere */}
              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Descriere *
                </label>
                <textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={4}
                  placeholder="Descrie evenimentul, ce vor învăța participanții, ce să aducă..."
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>

              {submitError && (
                <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {submitError}
                </p>
              )}

              <button
                type="submit"
                disabled={isSaving || !isFormValid}
                className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              >
                {isSaving ? "Se publică..." : "Publică Evenimentul"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
