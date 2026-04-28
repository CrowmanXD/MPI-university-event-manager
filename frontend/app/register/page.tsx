"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";

const EMAIL_DOMAIN = "@student.university.edu";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (value: string) => {
    if (!value.endsWith(EMAIL_DOMAIN)) {
      return `Email-ul trebuie să se termine cu ${EMAIL_DOMAIN}.`;
    }
    return "";
  };

  const validatePassword = (value: string) => {
    if (value.length < 8) {
      return "Parola trebuie să aibă minim 8 caractere.";
    }
    if (!/\d/.test(value)) {
      return "Parola trebuie să conțină cel puțin o cifră.";
    }
    return "";
  };

  const hasValidationErrors = useMemo(() => {
    return Boolean(validateEmail(email) || validatePassword(password));
  }, [email, password]);

  const isSubmitDisabled =
    loading || !firstName || !lastName || !email || !password || hasValidationErrors;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    const currentEmailError = validateEmail(email);
    const currentPasswordError = validatePassword(password);
    setEmailError(currentEmailError);
    setPasswordError(currentPasswordError);

    if (currentEmailError || currentPasswordError) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, firstName, lastName }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitError(data.error || "Nu am putut crea contul.");
        return;
      }

      setIsSuccess(true);
    } catch {
      setSubmitError(
        "Nu am putut crea contul. Te rugăm să încerci din nou în câteva momente.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-semibold text-gray-900 text-center">
          Înregistrare
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Creează un cont folosind adresa instituțională.
        </p>

        {isSuccess ? (
          <div className="mt-6 space-y-4">
            <p className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              Cont creat cu succes! Te rugăm să îți verifici emailul pentru
              confirmare.
            </p>
            <p className="text-center text-sm text-gray-600">
              <Link href="/login" className="font-medium text-blue-600 hover:underline">
                Mergi la autentificare
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
            {/* First Name + Last Name — deasupra Email-ului (AC #38) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Prenume
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Ion"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Nume
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Popescu"
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(validateEmail(e.target.value));
                }}
                placeholder={`nume${EMAIL_DOMAIN}`}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                aria-describedby="email-error"
              />
              {emailError && (
                <p id="email-error" className="mt-2 text-sm text-red-600">
                  {emailError}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Parolă
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(validatePassword(e.target.value));
                }}
                placeholder="Minim 8 caractere, cel puțin o cifră"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                aria-describedby="password-error"
              />
              {passwordError && (
                <p id="password-error" className="mt-2 text-sm text-red-600">
                  {passwordError}
                </p>
              )}
            </div>

            {submitError && (
              <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {submitError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
            >
              {loading ? "Se procesează..." : "Creare Cont"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Ai deja cont?{" "}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            Autentifică-te
          </Link>
        </p>
      </div>
    </div>
  );
}
