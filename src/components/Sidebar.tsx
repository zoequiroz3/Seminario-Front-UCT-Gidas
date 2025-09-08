import { NavLink } from "react-router-dom";
import { Home, Search, Users, BookOpen, DollarSign } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/busqueda", label: "Búsqueda", icon: Search },
  { to: "/personal", label: "Personal", icon: Users },
  { to: "/actividades", label: "Actividades I+D+i", icon: BookOpen },
  { to: "/financiamiento", label: "Objetos y financiamiento", icon: DollarSign },
];

export default function Sidebar() {
  return (
    <aside className="w-24 shrink-0 border-r border-slate-200 bg-white/70 backdrop-blur">
      <div className="flex flex-col items-center py-6 gap-6">
        {/* Avatar inicial */}
        <div className="w-12 h-12 rounded-full bg-slate-200 grid place-items-center text-slate-600">
          👤
        </div>

        {/* Links de navegación */}
        <nav className="flex flex-col items-center gap-5 text-[11px] text-slate-600">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `group flex flex-col items-center gap-1 ${
                  isActive ? "text-slate-900" : "hover:text-slate-800"
                }`
              }
              title={label}
            >
              <span className="w-8 h-8 rounded-full bg-slate-100 grid place-items-center border border-slate-200 group-hover:bg-slate-200">
                <Icon className="w-4 h-4" />
              </span>
              <span className="text-center opacity-80">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
}
