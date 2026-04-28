"use client";

import { FormEvent, useMemo, useState } from "react";

const EMAIL_DOMAIN = "@student.university.edu";

export default function RegisterPage() {
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
    const currentEmailError = validateEmail(email);
    const currentPasswordError = validatePassword(password);

    return Boolean(currentEmailError || currentPasswordError);
  }, [email, password]);

  const isSubmitDisabled = loading || !email || !password || hasValidationErrors;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    const currentEmailError = validateEmail(email);
    const currentPasswordError = validatePassword(password);

    setEmailError(currentEmailError);
    setPasswordError(currentPasswordError);

    if (currentEmailError || currentPasswordError) {
      return;
    }

    setLoading(true);

    try {
      // 1. Citim adresa backend-ului din variabilele de mediu Vercel.
      // Dacă nu există (de ex. când lucrați pe laptop), dă fallback pe localhost.
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

      // 2. Lipim adresa de bază la ruta specifică
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Request-ul de înregistrare a eșuat.");
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

  const handleEmailChange = (value: string) => {
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setPasswordError(validatePassword(value));
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
          <p className="mt-6 rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            Cont creat cu succes! Te rugăm să îți verifici emailul pentru
            confirmare.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate>
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
                onChange={(event) => handleEmailChange(event.target.value)}
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
                onChange={(event) => handlePasswordChange(event.target.value)}
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
      </div>
    </div>
  );
}
