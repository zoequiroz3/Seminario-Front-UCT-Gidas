import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar"; // ahora es el botón hamburguesa
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import { useState, useRef, useEffect } from "react"; // Import useState, useRef, useEffect
import { LogOut, User as UserIcon } from "lucide-react"; // Import icons

export default function AppLayout() {
  const { user, logout } = useAuth(); // Access user and logout from AuthContext
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <div className="min-h-screen bg-[#F6F6FB] text-slate-800 flex flex-col">
      {/* Header */}
      <header className="w-full flex items-center justify-between px-2 py-1 border-b border-slate-200 bg-white text-xs h-[40px]">
        <Sidebar />

        <h1 className="font-semibold text-sm"></h1>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1 text-base leading-none p-2 rounded-full hover:bg-slate-100 transition-colors"
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            <UserIcon className="w-5 h-5" /> {/* Generic user icon */}
            <span className="hidden sm:inline">{user?.nombre}</span> {/* Display username */}
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-slate-200">
              <div className="block px-4 py-2 text-sm text-slate-700 border-b border-slate-100">
                {user?.nombre}
              </div>
              <button
                onClick={logout}
                className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
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
