import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { getMe } from "../services/auth.service";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: "student" | "faculty" | "admin";
  isEmailVerified?: boolean;
  department?: string;
  facultyId?: string;
  designation?: string;
  qualification?: string;
  officeHours?: string;
  profilePhoto?: string;
  is2FAEnabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, initialUser?: User) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      getMe()
        .then((data) => setUser(data.user))
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token: string, initialUser?: User) => {
    localStorage.setItem("token", token);
    if (initialUser) {
      setUser(initialUser);
    }
    getMe()
      .then((data) => setUser(data.user))
      .catch(() => {
        if (!initialUser) {
          localStorage.removeItem("token");
          setUser(null);
        }
      });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("remember_user");
    setUser(null);
  };

  const updateUser = (updatedData: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : null));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
