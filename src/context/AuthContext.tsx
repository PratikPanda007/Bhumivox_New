import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { authService, type PublicUser } from "@/data/auth-service";

type AuthContextValue = {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (input: { name: string; email: string; phone: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (patch: { name?: string; phone?: string; avatar?: string }) => Promise<void>;
  changePassword: (current: string, next: string) => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = await authService.login(email, password);
    setUser(u);
  }, []);

  const signup = useCallback(async (input: { name: string; email: string; phone: string; password: string }) => {
    const u = await authService.signup(input);
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    async (patch: { name?: string; phone?: string; avatar?: string }) => {
      if (!user) throw new Error("Not authenticated.");
      const u = await authService.updateProfile(user.userId, patch);
      setUser(u);
    },
    [user],
  );

  const changePassword = useCallback(
    async (current: string, next: string) => {
      if (!user) throw new Error("Not authenticated.");
      await authService.changePassword(user.userId, current, next);
    },
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, login, signup, logout, updateProfile, changePassword }),
    [user, loading, login, signup, logout, updateProfile, changePassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
