import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { apiService, type User } from "./api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiService.login(email, password);

    if (response.success && response.data) {
      const { access_token } = response.data;
      apiService.setToken(access_token);
      setToken(access_token);

      // Store minimal user info
      const userInfo: User = {
        id: 0, // We don't have user ID from login response
        email: email,
        username: email.split("@")[0],
      };
      localStorage.setItem("user", JSON.stringify(userInfo));
      setUser(userInfo);

      return { success: true };
    }

    return { success: false, error: response.error || "Login failed" };
  }, []);

  const register = useCallback(async (email: string, username: string, password: string) => {
    const response = await apiService.register(email, username, password);

    if (response.success && response.data) {
      return { success: true };
    }

    return { success: false, error: response.error || "Registration failed" };
  }, []);

  const logout = useCallback(() => {
    apiService.removeToken();
    setToken(null);
    setUser(null);
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
