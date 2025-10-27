// contexts/AuthContext.tsx - добавьте отладку
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useStorageState } from '@/app/hooks/useStorageState';

const AuthContext = createContext<{
  token: string | null;
  isLoading: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
}>({
  token: null,
  isLoading: false,
  signIn: () => null,
  signOut: () => null,
});

export function useAuth() {
  const value = useContext(AuthContext);
  console.log('useAuth token:', value.token ? 'Token exists' : 'No token'); // Добавьте эту строку
  return value;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [[isLoading, token], setToken] = useStorageState('token');

  console.log('AuthProvider token state:', { isLoading, token }); // Добавьте эту строку

  return (
    <AuthContext.Provider
      value={{
        signIn: (token: string) => setToken(token),
        signOut: () => setToken(null),
        token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}