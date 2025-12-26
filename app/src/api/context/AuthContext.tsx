"use client"
import React, { createContext, useContext, useState } from 'react';

type User = {
  codigo_user: string;
  nombre: string;
  puesto: string;
  rol: number;
};

type AuthContextType = {
  user: User | null;
  setUser: (u: User | null) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
};
