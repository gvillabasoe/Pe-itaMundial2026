"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { User } from "@/lib/data";
import { MOCK_USERS } from "@/lib/data";

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  favorites: string[];
  toggleFavorite: (teamId: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => false,
  logout: () => {},
  favorites: [],
  toggleFavorite: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const login = (username: string, _password: string): boolean => {
    const clean = username.replace("@", "");
    const found = MOCK_USERS.find(
      (u) => u.username.toLowerCase() === clean.toLowerCase()
    );
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const toggleFavorite = (teamId: string) => {
    setFavorites((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId]
    );
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, favorites, toggleFavorite }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
