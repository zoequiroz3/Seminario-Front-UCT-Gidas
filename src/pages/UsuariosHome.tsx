import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getUsuarios, eliminarUsuario, type Usuario } from "@/services/usuariosService";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/Button";
import { Users, Plus, Trash2, AlertCircle, X } from "lucide-react";
import { useState } from "react";

export default function UsuariosHome() {
  const { isAdmin } = useAuth();
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const [usuarioAEliminar, setUsuarioAEliminar] = useState<Usuario | null>(null);

  if (!isAdmin()) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Acceso Denegado</h2>
        <p className="text-slate-500">No tienes permisos para gestionar usuarios.</p>
      </div>
    );
  }

  const { data: usuarios, isLoading, error } = useQuery({
    queryKey: ["usuarios"],
    queryFn: getUsuarios,
  });

  const eliminarMutation = useMutation({
    mutationFn: eliminarUsuario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      setUsuarioAEliminar(null);
    },
  });

  function handleEliminar(usuario: Usuario) {
    setUsuarioAEliminar(usuario);
  }

  function confirmarEliminar() {
    if (usuarioAEliminar) {
      eliminarMutation.mutate(usuarioAEliminar.id);
    }
  }

  return (
    <section className="w-full">
      <h2 className="text-2xl md:text-3xl font-semibold leading-none">
        Gestión de Usuarios
      </h2>

      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Users className="w-6 h-6 text-slate-700" />
          </div>
          <div>
            <p className="text-sm text-slate-600">
              {usuarios?.length || 0} usuario{usuarios?.length !== 1 ? "s" : ""} registrados
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={() => nav("/usuarios/nuevo")}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </Button>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-pulse space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-slate-200 rounded"></div>
                    <div className="h-3 w-48 bg-slate-100 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600">
            Error al cargar usuarios
          </div>
        ) : !usuarios || usuarios.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">No hay usuarios registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Usuario</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Rol</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Estado</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">{usuario.nombre_usuario}</p>
                        <p className="text-xs text-slate-500">ID: {usuario.id}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{usuario.mail}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        usuario.rol === "ADMIN"
                          ? "bg-violet-100 text-violet-700 border border-violet-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}>
                        {usuario.rol === "ADMIN" ? "Administrador" : "Gestor"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs ${
                        usuario.activo ? "text-green-600" : "text-slate-400"
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${usuario.activo ? "bg-green-500" : "bg-slate-300"}`} />
                        {usuario.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => handleEliminar(usuario)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL CONFIRMAR ELIMINACIÓN */}
      {usuarioAEliminar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">¿Eliminar usuario?</h3>
              <button
                onClick={() => setUsuarioAEliminar(null)}
                className="p-1 hover:bg-slate-100 rounded"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            
            <p className="text-slate-600 mb-6">
              Estás a punto de eliminar al usuario{" "}
              <strong>{usuarioAEliminar.nombre_usuario}</strong>. Esta acción no se puede deshacer.
            </p>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setUsuarioAEliminar(null)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={confirmarEliminar}
                className="flex-1 bg-rose-600 hover:bg-rose-700"
                disabled={eliminarMutation.isPending}
              >
                {eliminarMutation.isPending ? "Eliminando..." : "Eliminar"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
