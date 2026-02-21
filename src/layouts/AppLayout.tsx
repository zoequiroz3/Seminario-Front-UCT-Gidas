import { Outlet } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { User } from "lucide-react";

export default function AppLayout() {
  const { logout } = useAuth();

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar si clickeo afuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F6F6FB] text-slate-800 flex flex-col">
      
      {/* HEADER */}
      <header className="w-full flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white h-[48px]">
        <Sidebar />

        <h1 className="font-semibold text-sm tracking-tight">
          
        </h1>

        {/* USER MENU */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen(!open)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition"
          >
            <User className="w-6 h-6 text-slate-600" />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
              
              <button
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 transition"
              >
                Cerrar sesión
              </button>

            </div>
          )}
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="flex-1">
        <div className="w-full px-6 lg:px-10 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
