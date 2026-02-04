import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  login as loginService,
  register as registerService,
  logout as logoutService,
  getStoredAuth,
  clearStoredAuth,
  type User,
} from "@/services/authService";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (usuario: string, password: string) => Promise<void>; 
  register: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar sesión guardada al iniciar (F5)
  useEffect(() => {
    const stored = getStoredAuth();
    if (stored) {
      setUser(stored.user);
      setToken(stored.token);
    }
    setLoading(false);
  }, []);

  async function login(usuario: string, password: string) {
    // loginService devuelve { user, token }
    const auth = await loginService(usuario, password);
    setUser(auth.user);
    setToken(auth.token);
  }

  async function register(nombre: string, email: string, password: string) {
    // registerService no devuelve nada (void), solo crea la cuenta.
    await registerService(nombre, email, password);

    // El flujo es: Registro -> Redirigir a Login -> Usuario se loguea.
  }

  function logout() {
    logoutService(); // Limpia localStorage
    setUser(null);   // Limpia estado de React
    setToken(null);
  }

  const value: AuthContextValue = {
    user,
    token,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}