import { Fragment, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, type To } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";

type Item = {
  label: string;
  to?: To;
  children?: Item[];
};

const items: Item[] = [
  { label: "Inicio", to: "/" },
  {
    label: "Personal",
    children: [
      { label: "Ver todo el personal", to: "/personal" },
      {
        label: "Investigador/a",
        children: [
          { label: "Ver todos los Investigadores", to: "/investigadores" },
          { label: "Actividades en Docencia", to: "/docenciaInvestigador" },
          { label: "Trabajos en Reunión Científica", to: "/trabajosCientInv" },
        ],
      },
    ],
  },
  {
    label: "Proyectos",
    children: [
      { label: "Ver todos los proyectos", to: "/proyectos" },
      { label: "Trabajos en Revistas", to: "/trabajosProyectos" },
      { label: "Distinciones Recibidas", to: "/distincionesProyectos" },
    ],
  },
  {
    label: "Actividades I+D+i",
    children: [{ label: "Ver todas las Actividades", to: "/actividades" }],
  },
  {
    label: "Financiamiento",
    children: [
      { label: "Ver todos los objetos y financiamiento", to: "/financiamiento" },
      { label: "Equipamiento", to: "/equipamiento" },
      { label: "Erogaciones", to: "/erogaciones" },
    ],
  },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);     // visible a nivel de clase
  const [isVisible, setIsVisible] = useState(false); // visible en el DOM
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // ESC para cerrar
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Evitar scroll cuando está abierto
  useEffect(() => {
    document.body.style.overflow = isVisible ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isVisible]);

  const open = () => {
    setIsVisible(true);
    setTimeout(() => setIsOpen(true), 10); // darle tiempo a montar antes de animar
  };

  const close = () => {
    setIsOpen(false); // activa translate-x
    setTimeout(() => setIsVisible(false), 300); // luego desmonta
  };

  const toggleNode = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  const keyFrom = (label: string, to: To | undefined, idx: number, parentKey: string) => {
    const base = `${parentKey}/${idx}-${label}`;
    if (typeof to === "string") return `${base}::${to}`;
    if (to && typeof to === "object")
      return `${base}::${to.pathname ?? ""}${to.search ?? ""}${to.hash ?? ""}`;
    return `${base}::nolink`;
  };

  const MenuList = ({
    nodes,
    parentKey = "root",
    level = 0,
  }: {
    nodes: Item[];
    parentKey?: string;
    level?: number;
  }) => (
    <ul className={level === 0 ? "select-none" : "pl-5 border-l border-black/10"}>
      {nodes.map((node, idx) => {
        const hasChildren = !!node.children?.length;
        const key = keyFrom(node.label, node.to, idx, parentKey);
        const isNodeOpen = !!expanded[key];

        return (
          <li key={key} className="mb-1">
            <div className="flex items-stretch border-b border-black/10">
              {node.to ? (
                <NavLink
                  to={node.to}
                  onClick={close}
                  className={({ isActive }) =>
                    `flex-1 px-3 py-3 hover:bg-black/5 ${
                      level === 0 ? "text-slate-900" : "text-slate-700"
                    } ${isActive ? "font-semibold" : ""}`
                  }
                  end
                >
                  {node.label}
                </NavLink>
              ) : (
                <span
                  className={`flex-1 px-3 py-3 ${
                    level === 0 ? "text-slate-900" : "text-slate-700"
                  }`}
                >
                  {node.label}
                </span>
              )}

              {hasChildren && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleNode(key);
                  }}
                  aria-expanded={isNodeOpen}
                  aria-label={`Desplegar ${node.label}`}
                  className="px-3 py-3 hover:bg-black/5 text-slate-900"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isNodeOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}
            </div>

            <div
              className={`transition-all duration-300 overflow-hidden ${
                isNodeOpen ? "max-h-[500px] opacity-100 py-2" : "max-h-0 opacity-0"
              }`}
            >
              {hasChildren && (
                <MenuList nodes={node.children!} parentKey={key} level={level + 1} />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );

  const Overlay = (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/45 transition-opacity duration-300"
        onClick={close}
      />

      {/* Menú deslizante */}
      <div className="absolute inset-0 flex">
        <aside
          className={`h-full w-[320px] sm:w-[360px] md:w-[420px] bg-[#e9eaec] shadow-2xl border-r border-black/10 overflow-y-auto
            transform transition-transform duration-300
            ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/10">
            <span className="font-semibold tracking-wide">MENÚ</span>
            <button
              aria-label="Cerrar menú"
              onClick={close}
              className="p-2 rounded-md hover:bg-black/5"
            >
              <X size={22} />
            </button>
          </div>
          <nav className="px-4 py-2">
            <MenuList nodes={items} />
          </nav>
        </aside>

        <div className="flex-1 h-full" onClick={close} />
      </div>
    </div>
  );

  return (
    <Fragment>
      <button
        aria-label="Abrir menú"
        onClick={open}
        className="p-2 rounded-md hover:bg-slate-100 text-slate-700"
      >
        <Menu size={26} />
      </button>

      {isVisible && createPortal(Overlay, document.body)}
    </Fragment>
  );
}
