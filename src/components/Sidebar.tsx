// Sidebar.tsx — overlay FULL con submenús anidados (recursivo, type-safe)
import { Fragment, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, type To } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";

type Item = {
  label: string;
  to?: To;          // puede ser string o { pathname, search, hash }
  children?: Item[]; // subitems (anidado)
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
  const [open, setOpen] = useState(false);

  // qué nodos están expandidos (clave -> boolean)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // bloquear scroll y cerrar con ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const toggleNode = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

  // genera una key de string SIEMPRE segura (no usa To directamente)
  const keyFrom = (label: string, to: To | undefined, idx: number, parentKey: string) => {
    const base = `${parentKey}/${idx}-${label}`;
    if (typeof to === "string") return `${base}::${to}`;
    if (to && typeof to === "object")
      return `${base}::${to.pathname ?? ""}${to.search ?? ""}${to.hash ?? ""}`;
    return `${base}::nolink`;
  };

  // RENDER RECURSIVO
  const MenuList = ({
    nodes,
    parentKey = "root",
    level = 0,
  }: {
    nodes: Item[];
    parentKey?: string;
    level?: number;
  }) => {
    return (
      <ul className={level === 0 ? "select-none" : "pl-5 border-l border-black/10"}>
        {nodes.map((node, idx) => {
          const hasChildren = !!node.children?.length;
          const key = keyFrom(node.label, node.to, idx, parentKey);
          const isOpen = !!expanded[key];

          return (
            <li key={key} className="mb-1">
              <div className="flex items-stretch border-b border-black/10">
                {/* Link (si hay 'to'), sino texto */}
                {typeof node.to !== "undefined" ? (
                  <NavLink
                    to={node.to}
                    onClick={() => setOpen(false)}
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

                {/* Flecha para desplegar si tiene hijos */}
                {hasChildren && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleNode(key);
                    }}
                    aria-expanded={isOpen}
                    aria-label={`Desplegar ${node.label}`}
                    className="px-3 py-3 hover:bg-black/5 text-slate-900"
                  >
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                )}
              </div>

              {/* Subárbol */}
              {hasChildren && isOpen && (
                <div className="py-2">
                  <MenuList nodes={node.children!} parentKey={key} level={level + 1} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  const Overlay = (
    <div
      className="fixed inset-0 w-screen h-screen z-[9999]"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/45" onClick={() => setOpen(false)} />

      {/* Layout del overlay */}
      <div className="absolute inset-0 flex">
        {/* Panel lateral */}
        <aside className="h-full w-[320px] sm:w-[360px] md:w-[420px] bg-[#e9eaec] shadow-2xl border-r border-black/10 overflow-y-auto">
          {/* Header del panel */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-black/10">
            <span className="font-semibold tracking-wide">MENÚ</span>
            <button
              aria-label="Cerrar menú"
              onClick={() => setOpen(false)}
              className="p-2 rounded-md hover:bg-black/5"
            >
              <X size={22} />
            </button>
          </div>

          {/* Lista recursiva */}
          <nav className="px-4 py-2">
            <MenuList nodes={items} />
          </nav>
        </aside>

        {/* Zona derecha que cierra al click */}
        <div className="flex-1 h-full" onClick={() => setOpen(false)} />
      </div>
    </div>
  );

  return (
    <Fragment>
      {/* Botón hamburguesa (colocá este componente en tu header) */}
      <button
        aria-label="Abrir menú"
        onClick={() => setOpen(true)}
        className="p-2 rounded-md hover:bg-slate-100 text-slate-700"
      >
        <Menu size={26} />
      </button>

      {open && createPortal(Overlay, document.body)}
    </Fragment>
  );
}
