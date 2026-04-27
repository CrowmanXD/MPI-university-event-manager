"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type StudentAttendance = {
  name: string;
  email: string;
  status: "Confirmat";
};

const EVENT_CAPACITY = 50;

const MOCK_STUDENTS: StudentAttendance[] = [
  {
    name: "Andrei Popescu",
    email: "andrei.popescu@student.university.edu",
    status: "Confirmat",
  },
  {
    name: "Maria Ionescu",
    email: "maria.ionescu@student.university.edu",
    status: "Confirmat",
  },
  {
    name: "Radu Marinescu",
    email: "radu.marinescu@student.university.edu",
    status: "Confirmat",
  },
  {
    name: "Elena Dumitrescu",
    email: "elena.dumitrescu@student.university.edu",
    status: "Confirmat",
  },
  {
    name: "Vlad Georgescu",
    email: "vlad.georgescu@student.university.edu",
    status: "Confirmat",
  },
];

export default function EventAttendanceDashboardPage() {
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAttendanceData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setStudents(MOCK_STUDENTS);
    } catch {
      setError(
        "Ne pare rau, am intampinat o problema la conectarea cu serverul",
      );
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    void fetchAttendanceData();
  }, [fetchAttendanceData]);

  const enrollmentCount = students.length;
  const progressPercent = useMemo(
    () => Math.min((enrollmentCount / EVENT_CAPACITY) * 100, 100),
    [enrollmentCount],
  );

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">
            Event Attendance Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Studenti inscrisi:{" "}
            <span className="font-semibold text-blue-700">
              {enrollmentCount} / {EVENT_CAPACITY}
            </span>{" "}
            (Capacitate maxima)
          </p>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={EVENT_CAPACITY}
              aria-valuenow={enrollmentCount}
              aria-label="Progres inscrieri"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-[280px] flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <p className="mt-4 text-sm font-medium text-gray-600">
              Se incarca datele...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="text-xl text-red-600" aria-hidden="true">
                ⚠️
              </span>
              <div>
                <h2 className="text-base font-semibold text-red-800">Eroare</h2>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <button
                  type="button"
                  onClick={() => void fetchAttendanceData()}
                  className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Reincearca
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm text-gray-700">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Nume Student</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-6 py-10 text-center text-gray-500"
                      >
                        Niciun student inscris inca.
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr
                        key={student.email}
                        className="border-t border-gray-100 transition hover:bg-blue-50/40"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-6 py-4">{student.email}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            {student.status}
                          </span>
                        </td>
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
