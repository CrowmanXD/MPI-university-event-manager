"use client";

import { useEffect, useMemo, useState } from "react";

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

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setStudents(MOCK_STUDENTS);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, []);

  const enrollmentCount = students.length;
  const progressPercent = useMemo(() => {
    return Math.min((enrollmentCount / EVENT_CAPACITY) * 100, 100);
  }, [enrollmentCount]);

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-900">
            Event Attendance Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Studenți înscriși:{" "}
            <span className="font-semibold text-blue-700">
              {enrollmentCount} / {EVENT_CAPACITY}
            </span>{" "}
            (Capacitate maximă)
          </p>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={EVENT_CAPACITY}
              aria-valuenow={enrollmentCount}
              aria-label="Progres înscrieri"
            />
          </div>
        </div>

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
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      Se încarcă datele...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      Niciun student înscris încă.
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
      </div>
    </div>
  );
}
