import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(nombre, email, password);
      nav("/", { replace: true });
    } catch (err: any) {
      setError(err?.message ?? "Error al registrarse");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-[#F6F6FB]">
      <div className="card w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4">Registro</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nombre de usuario</label>
            <input
              className="input"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ingresa tu nombre de usuario"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              className="input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ingresa tu email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Contraseña</label>
            <input
              className="input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
            />
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-slate-900 text-white py-2.5 hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Creando cuenta…" : "Registrarse"}
          </button>
        </form>
        <p className="mt-4 text-sm text-slate-600">
          ¿Ya tenés cuenta?{" "}
          <Link to="/login" className="text-slate-900 underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
