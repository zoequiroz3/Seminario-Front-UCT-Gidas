import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar"; // ahora es el botón hamburguesa

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#F6F6FB] text-slate-800 flex flex-col">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
        {/* Botón hamburguesa a la izquierda */}
        <Sidebar />

        {/* Título / logo */}
        <h1 className="font-semibold text-lg"></h1>

        {/* Ejemplo: avatar a la derecha */}
        <div>👤</div>
      </header>

      {/* Contenido */}
      <main className="flex-1">
        <div className="w-full px-6 lg:px-10 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
