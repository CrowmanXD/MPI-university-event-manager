import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-4xl font-bold text-blue-600 mb-8 text-center">
        University Event Manager
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
        <Link 
          href="/event-catalog" 
          className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition text-center font-semibold text-gray-800"
        >
          📅 Catalog Evenimente
        </Link>
        
        <Link 
          href="/register" 
          className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition text-center font-semibold text-gray-800"
        >
          🎓 Înregistrare Student
        </Link>
        
        <Link 
          href="/event-editor" 
          className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition text-center font-semibold text-gray-800"
        >
          ✍️ Creare Eveniment Nou
        </Link>
        
        <Link 
          href="/event-attendance-dashboard" 
          className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition text-center font-semibold text-gray-800"
        >
          📊 Dashboard Prezență
        </Link>
      </div>
    </div>
  );
}