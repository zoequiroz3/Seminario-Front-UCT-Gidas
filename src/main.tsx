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
import UCTProtected from "@/components/UCTProtected";

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
import ProyectosDetalle from "./pages/ProyectosDetalle";
import RegistrosPropiedadHome from "./pages/RegistrosPropiedadHome";
import RegistrosPropiedadForm from "./pages/RegistrosPropiedadForm";
import RegistrosPropiedadDetalle from "./pages/RegistrosPropiedadDetalle";
import PlanificacionGrupoLanding from "./pages/PlanificacionesGrupoHome";
import PlanificacionesGrupoForm from "./pages/PlanificacionesGrupoForm";
import PlanificacionGrupoDetalle from "./pages/PlanificacionGrupoDetalle";
import TrabajosReunionDetalle from "./pages/TrabajosReunionDetalle";
import TrabajosRevistasHome from "./pages/TrabajosRevistasHome";
import TrabajosRevistasForm from "./pages/TrabajosRevistasForm";
import TrabajosRevistasDetalle from "./pages/TrabajosRevistasDetalle";
import ArticulosDivulgacionLanding from "./pages/ArticulosDivulgacionHome";
import ArticulosDivulgacionForm from "./pages/ArticulosDivulgacionForm";
import ArticulosDivulgacionDetalle from "./pages/ArticulosDivulgacionDetalle";
import TransferenciasForm from "./pages/TransferenciasForm";
import TransferenciasDetalle from "./pages/TransferenciasDetalle";
import TransferenciasHome from "./pages/TransferenciasHome";
import DistincionesHome from "./pages/DistincionesHome";
import DistincionesForm from "./pages/DistincionesForm";
import DistincionesDetalle from "./pages/DistincionesDetalle";
import ParticipacionesHome from "./pages/ParticipacionesHome";
import ParticipacionesForm from "./pages/ParticipacionesForm";
import ParticipacionesDetalle from "./pages/ParticipacionesDetalle";
import VisitantesHome from "./pages/VisitantesHome";
import VisitantesForm from "./pages/VisitantesForm";
import VisitantesDetalle from "./pages/VisitantesDetalle";

// Gestión de usuarios
import CambiarPassword from "./pages/CambiarPassword";
import UsuariosHome from "./pages/UsuariosHome";
import UsuariosForm from "./pages/UsuariosForm";
import CatalogosHome from "./pages/CatalogosHome";

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
      { path: "personal", element: <UCTProtected><PersonalLanding /></UCTProtected> },   // landing  
      { path: "personal/nuevo", element: <UCTProtected><PersonalForm /></UCTProtected> },    // formulario
      { path: "personal/:rol/:id", element: <UCTProtected><PersonalDetalle /></UCTProtected> }, // detalle de personal
      { path: "personal/:rol/:id/editar", element: <UCTProtected><PersonalForm /></UCTProtected> }, // editar personal
      { path: "becarios/:id/editar", element: <UCTProtected><PersonalForm /></UCTProtected> }, // editar becario
      { path: "investigadores/:id/editar", element: <UCTProtected><PersonalForm /></UCTProtected> }, // editar investigador
      { path: "becarios/:id", element: <UCTProtected><PersonalDetalle /></UCTProtected> }, // detalle de becario
      { path: "investigadores/:id", element: <UCTProtected><PersonalDetalle /></UCTProtected> }, // detalle de investigador
      { path: "ptaa/:id", element: <UCTProtected><PersonalDetalle /></UCTProtected> }, // detalle de PTAA
      { path: "profesionales/:id", element: <UCTProtected><PersonalDetalle /></UCTProtected> }, // detalle de profesional
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
      { path: "proyectos", element: <UCTProtected><ProyectosLanding /></UCTProtected> },
      { path: "proyectos/nuevo", element: <UCTProtected><ProyectosForm /></UCTProtected> },
      { path: "proyectos/:id", element: <UCTProtected><ProyectosDetalle /></UCTProtected> },
      { path: "proyectos/editar/:id", element: <UCTProtected><ProyectosForm /></UCTProtected> },
      // Docencia
      { path: "docenciaInvestigador", element: <UCTProtected><DocenciaLanding /></UCTProtected> },
      { path: "docenciaInvestigador/nuevo", element: <UCTProtected><DocenciaForm /></UCTProtected> },
      { path: "docenciaInvestigador/:id", element: <UCTProtected><DocenciaDetalle /></UCTProtected> },
      { path: "docenciaInvestigador/:id/editar", element: <UCTProtected><DocenciaForm /></UCTProtected> },

      // Trabajos en reuniones científicas
      { path: "trabajosCientInv", element: <UCTProtected><TrabajosReunionHome /></UCTProtected> },
      { path: "trabajosCientInv/nuevo", element: <UCTProtected><TrabajosReunionForm /></UCTProtected> },

      //Actividades I+D+I
      //Registros de propiedad  e industrial
      { path: "registros-propiedad", element: <UCTProtected><RegistrosPropiedadHome /></UCTProtected> },
      { path: "registros-propiedad/nuevo", element: <UCTProtected><RegistrosPropiedadForm /></UCTProtected> },
      { path: "registros-propiedad/:id", element: <UCTProtected><RegistrosPropiedadDetalle /></UCTProtected> },
      { path: "registros-propiedad/:id/editar", element: <UCTProtected><RegistrosPropiedadForm /></UCTProtected> },

      // Planificaciones de grupo
      { path: "planificaciones", element: <UCTProtected><PlanificacionGrupoLanding /></UCTProtected> },
      { path: "planificaciones/nuevo", element: <UCTProtected><PlanificacionesGrupoForm /></UCTProtected> },
      { path: "planificaciones/:id", element: <UCTProtected><PlanificacionGrupoDetalle /></UCTProtected> },
      { path: "planificaciones/:id/editar", element: <UCTProtected><PlanificacionesGrupoForm /></UCTProtected> },

      //Trabajos en reuniones científicas
      { path: "trabajos-reunion", element: <UCTProtected><TrabajosReunionHome /></UCTProtected> },
      { path: "trabajos-reunion/nuevo", element: <UCTProtected><TrabajosReunionForm /></UCTProtected> },
      { path: "trabajos-reunion/:id", element: <UCTProtected><TrabajosReunionDetalle /></UCTProtected> },
      { path: "trabajos-reunion/:id/editar", element: <UCTProtected><TrabajosReunionForm /></UCTProtected> },

      //Trabajos en revistas
      { path: "trabajos-revistas", element: <UCTProtected><TrabajosRevistasHome /></UCTProtected> },
      { path: "trabajos-revistas/nuevo", element: <UCTProtected><TrabajosRevistasForm /></UCTProtected> },
      { path: "trabajos-revistas/:id", element: <UCTProtected><TrabajosRevistasDetalle /></UCTProtected> },
      { path: "trabajos-revistas/:id/editar", element: <UCTProtected><TrabajosRevistasForm /></UCTProtected> },

      //Artículos de divulgación
      { path: "articulos-divulgacion", element: <UCTProtected><ArticulosDivulgacionLanding /></UCTProtected> },
      { path: "articulos-divulgacion/nuevo", element: <UCTProtected><ArticulosDivulgacionForm /></UCTProtected> },
      { path: "articulos-divulgacion/:id", element: <UCTProtected><ArticulosDivulgacionDetalle /></UCTProtected> },
      { path: "articulos-divulgacion/:id/editar", element: <UCTProtected><ArticulosDivulgacionForm /></UCTProtected> },




      // Erogaciones / Compras
      { path: "erogaciones", element: <UCTProtected><ErogacionesLanding /></UCTProtected> },
      { path: "erogaciones/nuevo", element: <UCTProtected><ErogacionesForm /></UCTProtected> },
      { path: "erogaciones/:id", element: <UCTProtected><ErogacionesDetalle /></UCTProtected> },
      { path: "erogaciones/:id/editar", element: <UCTProtected><ErogacionesForm /></UCTProtected> },

      // Equipamiento
      { path: "equipamiento", element: <UCTProtected><EquipamientoLanding /></UCTProtected> },
      { path: "equipamiento/nuevo", element: <UCTProtected><EquipamientoForm /></UCTProtected> },
      { path: "equipamiento/:id", element: <UCTProtected><EquipamientoDetalle /></UCTProtected> },
      { path: "equipamiento/:id/editar", element: <UCTProtected><EquipamientoForm /></UCTProtected> },

      // Objetos y financiamiento
      { path: "objetosfinanciamiento", element: <UCTProtected><ObjetosLanding /></UCTProtected> },

      // Documentación
      { path: "documentacion", element: <UCTProtected><DocumentacionLanding /></UCTProtected> },
      { path: "documentacion/nuevo", element: <UCTProtected><DocumentacionForm /></UCTProtected> },
      { path: "documentacion/:id", element: <UCTProtected><DocumentacionDetalle /></UCTProtected> },
      { path: "documentacion/:id/editar", element: <UCTProtected><DocumentacionForm /></UCTProtected> },

      // Transferencias (Vinculación Socio-Productiva)
      { path: "transferencias", element: <UCTProtected><TransferenciasHome /></UCTProtected> },
      { path: "transferencias/nuevo", element: <UCTProtected><TransferenciasForm /></UCTProtected> },
      { path: "transferencias/:id", element: <UCTProtected><TransferenciasDetalle /></UCTProtected> },
      { path: "transferencias/:id/editar", element: <UCTProtected><TransferenciasForm /></UCTProtected> },

      // Actividades I+D+i
      { path: "distinciones", element: <UCTProtected><DistincionesHome /></UCTProtected> },
      { path: "distinciones/nuevo", element: <UCTProtected><DistincionesForm /></UCTProtected> },
      { path: "distinciones/:id", element: <UCTProtected><DistincionesDetalle /></UCTProtected> },
      { path: "distinciones/:id/editar", element: <UCTProtected><DistincionesForm /></UCTProtected> },

      { path: "participaciones", element: <UCTProtected><ParticipacionesHome /></UCTProtected> },
      { path: "participaciones/nuevo", element: <UCTProtected><ParticipacionesForm /></UCTProtected> },
      { path: "participaciones/:id", element: <UCTProtected><ParticipacionesDetalle /></UCTProtected> },
      { path: "participaciones/:id/editar", element: <UCTProtected><ParticipacionesForm /></UCTProtected> },

      { path: "visitantes", element: <UCTProtected><VisitantesHome /></UCTProtected> },
      { path: "visitantes/nuevo", element: <UCTProtected><VisitantesForm /></UCTProtected> },
      { path: "visitantes/:id", element: <UCTProtected><VisitantesDetalle /></UCTProtected> },
      { path: "visitantes/:id/editar", element: <UCTProtected><VisitantesForm /></UCTProtected> },

      // Gestión de Usuarios (solo admin)
      {
        path: "cambiar-password",
        element: (
          <ProtectedRoute>
            <CambiarPassword />
          </ProtectedRoute>
        ),
      },
      {
        path: "usuarios",
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <UsuariosHome />
          </ProtectedRoute>
        ),
      },
      {
        path: "usuarios/nuevo",
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <UsuariosForm />
          </ProtectedRoute>
        ),
      },
      {
        path: "catalogos",
        element: (
          <ProtectedRoute requiredRole="ADMIN">
            <CatalogosHome />
          </ProtectedRoute>
        ),
      },

      { path: "*", element: <NotFound /> },
    ],
  },
]);

// Cliente de React Query
const queryClient = new QueryClient();

// Renderizado de la aplicación
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </QueryClientProvider>
);
