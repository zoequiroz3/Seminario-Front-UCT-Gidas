import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import "./styles/index.css";

import AppLayout from "@/layouts/AppLayout";
import Home from "@/pages/Home";
import UctForm from "@/pages/UctForm";
import NotFound from "@/pages/NotFound";

// 👇 nuevas páginas
import PersonalLanding from "@/pages/PersonalHome"; // título + botón Agregar + Volver
import Personal from "@/pages/PersonalForm";               // formulario de personal

// Definición de rutas
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Home /> },

      // UCT
      { path: "uct/nueva", element: <UctForm /> },

      // 👇 Personal
      { path: "personal", element: <PersonalLanding /> },   // landing
      { path: "personal/nuevo", element: <Personal /> },    // formulario

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
