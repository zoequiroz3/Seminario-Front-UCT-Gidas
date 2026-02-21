import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigate } from "react-router-dom";

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
import PersonalForm from "@/pages/PersonalForm";
import TransferenciasHome from "./pages/TransferenciasHome";
import TransferenciasForm from "./pages/TransferenciasForm";
import TransferenciasDetalle from "./pages/TransferenciasDetalle";

// Actividades I+D+i
import DistincionesHome from "./pages/DistincionesHome";
import DistincionesForm from "./pages/DistincionesForm";
import ParticipacionesHome from "./pages/ParticipacionesHome";
import ParticipacionesForm from "./pages/ParticipacionesForm";
import VisitantesHome from "./pages/VisitantesHome";
import VisitantesForm from "./pages/VisitantesForm";

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
      { path: "personal/nuevo", element: <PersonalForm /> },    // formulario
      { path: "personal/:rol/:id", element: <PersonalDetalle /> }, // detalle de personal
      { path: "personal/:rol/:id/editar", element: <PersonalForm /> }, // editar personal
      { path: "becarios/:id/editar", element: <PersonalForm /> }, // editar becario
      { path: "investigadores/:id/editar", element: <PersonalForm /> }, // editar investigador
      { path: "becarios/:id", element: <PersonalDetalle /> }, // detalle de becario
      { path: "investigadores/:id", element: <PersonalDetalle /> }, // detalle de investigador
      { path: "ptaa/:id", element: <PersonalDetalle /> }, // detalle de PTAA
      { path: "profesionales/:id", element: <PersonalDetalle /> }, // detalle de profesional
      // Redirecciones para mantener compatibilidad con URLs anteriores
      {
        path: "investigadores",
        element: <Navigate to="/personal?tipo=INVESTIGADOR" replace />
      },
      {
        path: "becarios",
        element: <Navigate to="/personal?tipo=BECARIO" replace />
      },
      {
        path: "ptaa",
        element: <Navigate to="/personal?tipo=PTAA" replace />
      },
      {
        path: "profesionales",
        element: <Navigate to="/personal?tipo=PROFESIONAL" replace />
      },


      // Proyectos
      { path: "proyectos", element: <ProyectosLanding /> },
      { path: "proyectos/nuevo", element: <ProyectosForm /> },

      // Docencia
      { path: "docenciaInvestigador", element: <DocenciaLanding /> },
      { path: "docenciaInvestigador/nuevo", element: <DocenciaForm /> },
      { path: "docenciaInvestigador/:id", element: <DocenciaDetalle /> },
      { path: "docenciaInvestigador/:id/editar", element: <DocenciaForm /> },

      // Trabajos en reuniones científicas
      { path: "trabajosCientInv", element: <TrabajosReunionHome /> },
      { path: "trabajosCientInv/nuevo", element: <TrabajosReunionForm /> },

      // Erogaciones / Compras
      { path: "erogaciones", element: <ErogacionesLanding /> },
      { path: "erogaciones/nuevo", element: <ErogacionesForm /> },
      { path: "erogaciones/:id", element: <ErogacionesDetalle /> },
      { path: "erogaciones/:id/editar", element: <ErogacionesForm /> },

      // Equipamiento
      { path: "equipamiento", element: <EquipamientoLanding /> },
      { path: "equipamiento/nuevo", element: <EquipamientoForm /> },
      { path: "equipamiento/:id", element: <EquipamientoDetalle /> },
      { path: "equipamiento/:id/editar", element: <EquipamientoForm /> },

      // Objetos y financiamiento
      { path: "objetosfinanciamiento", element: <ObjetosLanding /> },

      // Documentación
      { path: "documentacion", element: <DocumentacionLanding /> },
      { path: "documentacion/nuevo", element: <DocumentacionForm /> },
      { path: "documentacion/:id", element: <DocumentacionDetalle /> },
      { path: "documentacion/:id/editar", element: <DocumentacionForm /> },

      // Transferencias (Vinculación Socio-Productiva)
      { path: "transferencias", element: <TransferenciasHome /> },
      { path: "transferencias/nuevo", element: <TransferenciasForm /> },
      { path: "transferencias/:id", element: <TransferenciasDetalle /> },
      { path: "transferencias/:id/editar", element: <TransferenciasForm /> },

      // Actividades I+D+i
      { path: "distinciones", element: <DistincionesHome /> },
      { path: "distinciones/nuevo", element: <DistincionesForm /> },
      { path: "distinciones/:id", element: <DistincionesForm /> },
      { path: "distinciones/:id/editar", element: <DistincionesForm /> },

      { path: "participaciones", element: <ParticipacionesHome /> },
      { path: "participaciones/nuevo", element: <ParticipacionesForm /> },
      { path: "participaciones/:id", element: <ParticipacionesForm /> },
      { path: "participaciones/:id/editar", element: <ParticipacionesForm /> },

      { path: "visitantes", element: <VisitantesHome /> },
      { path: "visitantes/nuevo", element: <VisitantesForm /> },
      { path: "visitantes/:id", element: <VisitantesForm /> },
      { path: "visitantes/:id/editar", element: <VisitantesForm /> },

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
