import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./styles/index.css";

import AppLayout from "@/layouts/AppLayout";
import Home from "@/pages/Home";
import UctForm from "@/pages/UctForm";
import NotFound from "@/pages/NotFound";

// auth
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// nuevas páginas
import PersonalLanding from "@/pages/PersonalHome"; // título + botón Agregar + Volver
import Personal from "@/pages/PersonalForm";               // formulario de personal
import PersonalDetalle from "./pages/PersonalDetalle";
import ProyectosLanding from "./pages/ProyectosHome";
import ProyectosForm from "./pages/ProyectosForm";
import DocenciaLanding from "./pages/DocenciaHome";
import DocenciaForm from "./pages/DocenciaForm";
import DocenciaDetalle from "./pages/DocenciaDetalle";
import TrabajosReunionHome from "./pages/TrabajosReunionHome";
import TrabajosReunionForm from "./pages/TrabajosReunionForm";
import ErogacionesLanding from "./pages/ErogacionesHome";
import ErogacionesForm from "./pages/ErogacionesForm";
import ErogacionesDetalle from "./pages/ErogacionesDetalle";
import EquipamientoLanding from "./pages/EquipamientoHome";
import EquipamientoForm from "./pages/EquipamientoForm";
import EquipamientoDetalle from "./pages/EquipamientoDetalle";
import ObjetosLanding from "./pages/ObjetosFinHome";
import SearchPage from "./pages/SearchPage";
import DocumentacionDetalle from "./pages/DocumentacionDetalle";
import DocumentacionForm from "./pages/DocumentacionForm";
import DocumentacionLanding from "./pages/DocumentacionHome";

// Definición de rutas
const router = createBrowserRouter([
  // rutas públicas (sin login)
  { path: "/login", element: <Login /> },
  { path: "/registro", element: <Register /> },

  // rutas protegidas (requieren estar logueado)
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Home /> },

      { path: "busqueda", element: <SearchPage /> },

      // UCT
      { path: "uct/nueva", element: <UctForm /> },

      // Personal
      { path: "personal", element: <PersonalLanding /> },   // landing
      { path: "personal/nuevo", element: <Personal /> },    // formulario
      { path: "personal/:id", element: <PersonalDetalle /> }, // detalle de personal
      { path: "investigadores", element: <PersonalLanding presetTipo="INVESTIGADOR" /> },

      // Proyectos
      { path: "proyectos", element: <ProyectosLanding /> },
      { path: "proyectos/nuevo", element: <ProyectosForm /> },

      // Docencia
      { path: "docenciaInvestigador", element: <DocenciaLanding /> },
      { path: "docenciaInvestigador/nuevo", element: <DocenciaForm /> },
      { path: "docenciaInvestigador/:id", element: <DocenciaDetalle /> },

      // Trabajos en reuniones científicas
      { path: "trabajosCientInv", element: <TrabajosReunionHome /> },
      { path: "trabajosCientInv/nuevo", element: <TrabajosReunionForm /> },

      // Erogaciones / Compras
      { path: "erogaciones", element: <ErogacionesLanding /> },
      { path: "erogaciones/nuevo", element: <ErogacionesForm /> },
      { path: "erogaciones/:id", element: <ErogacionesDetalle /> },

      // Equipamiento
      { path: "equipamiento", element: <EquipamientoLanding /> },
      { path: "equipamiento/nuevo", element: <EquipamientoForm /> },
      { path: "equipamiento/:id", element: <EquipamientoDetalle /> },

      // Objetos y financiamiento
      { path: "objetosfinanciamiento", element: <ObjetosLanding /> },

      // Documentación
      { path: "documentacion", element: <DocumentacionLanding /> },
      { path: "documentacion/nuevo", element: <DocumentacionForm /> },
      { path: "documentacion/:id", element: <DocumentacionDetalle /> },
      { path: "documentacion/:id/editar", element: <DocumentacionForm /> },

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
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>
);
