import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar"; // ahora es el botón hamburguesa

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#F6F6FB] text-slate-800 flex flex-col">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-2 py-1 border-b border-slate-200 bg-white text-xs h-[40px]">
        <Sidebar />

        <h1 className="font-semibold text-sm"></h1>

        <div className="text-sm leading-none">👤</div>
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
