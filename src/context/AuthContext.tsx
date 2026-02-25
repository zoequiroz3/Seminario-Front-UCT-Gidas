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
  esPrimerUsuario as esPrimerUsuarioService,
  cambiarPassword as cambiarPasswordService,
  type User,
  type Rol,
} from "@/services/authService";

type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (usuario: string, password: string) => Promise<void>; 
  register: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  esPrimerUsuario: () => Promise<boolean>;
  cambiarPassword: (passwordActual: string, passwordNueva: string) => Promise<void>;
  isAdmin: () => boolean;
  isGestor: () => boolean;
  debeCambiarPassword: () => boolean;
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
    const auth = await loginService(usuario, password);
    setUser(auth.user);
    setToken(auth.token);
  }

  async function register(nombre: string, email: string, password: string) {
    await registerService(nombre, email, password);
  }

  async function esPrimerUsuario() {
    return esPrimerUsuarioService();
  }

  async function cambiarPassword(passwordActual: string, passwordNueva: string) {
    await cambiarPasswordService(passwordActual, passwordNueva);
    // Actualizar el estado del usuario para indicar que ya cambió la password
    if (user) {
      const updatedUser = { ...user, primer_login: false };
      setUser(updatedUser);
      // Actualizar también en localStorage
      const stored = getStoredAuth();
      if (stored) {
        localStorage.setItem("gidas_auth_current_session", JSON.stringify({
          ...stored,
          user: updatedUser,
        }));
      }
    }
  }

  function logout() {
    logoutService();
    setUser(null);
    setToken(null);
  }

  // Helpers para verificar roles
  function isAdmin(): boolean {
    return user?.rol === "ADMIN";
  }

  function isGestor(): boolean {
    return user?.rol === "GESTOR";
  }

  function debeCambiarPassword(): boolean {
    return user?.primer_login === true;
  }

  const value: AuthContextValue = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    esPrimerUsuario,
    cambiarPassword,
    isAdmin,
    isGestor,
    debeCambiarPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
