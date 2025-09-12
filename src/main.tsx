import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./styles/index.css";

import AppLayout from "@/layouts/AppLayout";
import Home from "@/pages/Home";
import UctForm from "@/pages/UctForm";
import NotFound from "@/pages/NotFound";

//nuevas páginas
import PersonalLanding from "@/pages/PersonalHome"; // título + botón Agregar + Volver
import Personal from "@/pages/PersonalForm";               // formulario de personal
import PersonalDetalle from "./pages/PersonalDetalle";
import FinanciamientoForm from "@/pages/FinanciamientoForm";
import FinanciamientoLanding from "@/pages/FinanciamientoHome";
import FinanciamientoDetalle from "./pages/FinanciamientoDetalle";
import ProyectosLanding from "./pages/ProyectosHome";
import ProyectosForm from "./pages/ProyectosForm";
import DocenciaLanding from "./pages/DocenciaHome";
import DocenciaForm from "./pages/DocenciaForm";
import DocenciaDetalle from "./pages/DocenciaDetalle";
import TrabajosReunionHome from "./pages/TrabajosReunionHome";
import TrabajosReunionForm from "./pages/TrabajosReunionForm";


// Definición de rutas
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },

      // UCT
      { path: "uct/nueva", element: <UctForm /> },

      // Personal
      { path: "personal", element: <PersonalLanding /> },   // landing
      { path: "personal/nuevo", element: <Personal /> },    // formulario
      { path: "personal/:id", element: <PersonalDetalle/>}, // detalle de personal
      { path: "investigadores", element: <PersonalLanding presetTipo="INVESTIGADOR" /> },
      { path: "financiamiento/nuevo", element: <FinanciamientoForm/>}, 
      { path: "financiamiento", element: <FinanciamientoLanding/>},
      { path: "financiamiento/:id", element: <FinanciamientoDetalle/>},
      { path: "proyectos", element: <ProyectosLanding/>},
      { path: "proyectos/nuevo", element: <ProyectosForm/>},
      { path: "docenciaInvestigador", element: <DocenciaLanding />},
      { path: "docenciaInvestigador/nuevo", element: <DocenciaForm />},
      { path: "docenciaInvestigador/:id", element: <DocenciaDetalle/>},
      { path: "trabajosCientInv", element: <TrabajosReunionHome/>},
      { path: "trabajosCientInv/nuevo", element: <TrabajosReunionForm/>},
      { path: "*", element: <NotFound /> },
    ],
  },
]);

// Cliente de React Query
const queryClient = new QueryClient();

// Renderizado de la aplicación
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);
