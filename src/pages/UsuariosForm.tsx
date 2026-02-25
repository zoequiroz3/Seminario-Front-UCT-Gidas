import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { crearUsuario } from "@/services/usuariosService";
import type { Rol } from "@/services/authService";
import Button from "@/components/Button";
import Field from "@/components/Field";
import { UserPlus, Eye, EyeOff, CheckCircle, Copy, ArrowLeft } from "lucide-react";

export default function UsuariosForm() {
  const nav = useNavigate();
  
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<Rol>("GESTOR");
  const [showPassword, setShowPassword] = useState(false);
  const [copiado, setCopiado] = useState(false);
  
  // Estado para mostrar el resultado exitoso
  const [creado, setCreado] = useState(false);
  const [usuarioCreado, setUsuarioCreado] = useState<{ nombre: string; password: string }> | null>(null);

  const crearMutation = useMutation({
    mutationFn: crearUsuario,
    onSuccess: () => {
      setCreado(true);
      setUsuarioCreado({ nombre, password });
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    
    if (password.length < 6) {
      return;
    }

    crearMutation.mutate({
      nombre_usuario: nombre,
      mail: email,
      password,
      rol,
    });
  }

  function copiarPassword() {
    if (usuarioCreado) {
      navigator.clipboard.writeText(usuarioCreado.password);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  }

  // Generar password aleatoria
  function generarPassword() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let result = "";
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
  }

  if (creado && usuarioCreado) {
    return (
      <section className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h2 className="text-xl font-semibold mb-2">¡Usuario Creado Exitosamente!</h2>
          
          <p className="text-slate-600 mb-6">
            El usuario <strong>{usuarioCreado.nombre}</strong> ha sido creado con éxito.
          </p>

          <div className="bg-slate-50 rounded-xl p-6 mb-6">
            <p className="text-sm text-slate-500 mb-2">Contraseña temporal:</p>
            <div className="flex items-center gap-2 justify-center">
              <code className="bg-slate-200 px-3 py-1.5 rounded-lg font-mono text-lg">
                {usuarioCreado.password}
              </code>
              <button
                onClick={copiarPassword}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                title="Copiar contraseña"
              >
                {copiado ? "¡Copiado!" : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-amber-800">
              <strong>Importante:</strong> Compartí esta contraseña de forma segura con el usuario. 
              Deberá cambiarla en su primer inicio de sesión.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => nav("/usuarios")}
              className="flex-1"
            >
              Volver al Listado
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setCreado(false);
                setUsuarioCreado(null);
                setNombre("");
                setEmail("");
                setPassword("");
                setRol("GESTOR");
              }}
              className="flex-1"
            >
              Crear Otro Usuario
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-2xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => nav("/usuarios")}
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-semibold">Nuevo Usuario</h2>
          <p className="text-slate-500 text-sm">Crear una cuenta de usuario para el sistema</p>
        </div>
      </div>

      {/* FORMULARIO */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Field label="Nombre de Usuario" required>
            <input
              type="text"
              className="input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: juan.perez"
              required
            />
          </Field>

          <Field label="Email" required>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej: juan@email.com"
              required
            />
          </Field>

          <Field label="Contraseña Temporal" required>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="input pr-24"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-20 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={generarPassword}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs bg-slate-100 hover:bg-slate-200 px-2 py-1 rounded transition-colors"
                >
                  Generar
                </button>
              </div>
              <p className="text-xs text-slate-400">
                El usuario deberá cambiar esta contraseña en su primer inicio de sesión.
              </p>
            </div>
          </Field>

          <Field label="Rol" required>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                rol === "GESTOR"
                  ? "border-slate-900 bg-slate-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}>
                <input
                  type="radio"
                  name="rol"
                  value="GESTOR"
                  checked={rol === "GESTOR"}
                  onChange={(e) => setRol(e.target.value as Rol)}
                  className="sr-only"
                />
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-medium">Gestor</p>
                  <p className="text-xs text-slate-500">Acceso estándar</p>
                </div>
              </label>

              <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                rol === "ADMIN"
                  ? "border-purple-500 bg-purple-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}>
                <input
                  type="radio"
                  name="rol"
                  value="ADMIN"
                  checked={rol === "ADMIN"}
                  onChange={(e) => setRol(e.target.value as Rol)}
                  className="sr-only"
                />
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-700 font-bold">A</span>
                </div>
                <div>
                  <p className="font-medium">Administrador</p>
                  <p className="text-xs text-slate-500">Control total del sistema</p>
                </div>
              </label>
            </div>
          </Field>

          {crearMutation.isError && (
            <div className="bg-rose-50 text-rose-600 text-sm px-4 py-3 rounded-lg border border-rose-100">
              Error al crear usuario: {crearMutation.error.message}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => nav("/usuarios")}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={crearMutation.isPending || password.length < 6}
              className="flex-1"
            >
              {crearMutation.isPending ? "Creando..." : "Crear Usuario"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
