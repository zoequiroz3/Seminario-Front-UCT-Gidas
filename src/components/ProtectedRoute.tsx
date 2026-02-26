import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { JSX } from "react";
import type { Rol } from "@/services/authService";

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRole?: Rol;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-slate-600">
        Cargando sesión…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Si se requiere un rol específico, verificar
  if (requiredRole) {
    const tieneRol = requiredRole === "ADMIN" ? isAdmin() : user.rol === requiredRole;
    
    if (!tieneRol) {
      // Redirigir a home si no tiene el rol requerido
      return <Navigate to="/" replace />;
    }
  }

  return children;
}
