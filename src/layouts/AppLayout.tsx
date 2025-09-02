import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-[#F6F6FB] text-slate-800 flex">
      {/* Sidebar */}
      <Sidebar />

      {/* Contenido */}
      <main className="flex-1">
        {/* Wrapper centrado y con ancho máximo global */}
        <div className="max-w-5xl mx-auto px-6 py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

