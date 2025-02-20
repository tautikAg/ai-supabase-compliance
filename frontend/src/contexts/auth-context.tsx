"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { APIService } from '@/lib/api';
import { SupabaseCredentials } from '@/types';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (credentials: SupabaseCredentials) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const credentials = localStorage.getItem('credentials');
    if (credentials) {
      APIService.setCredentials(JSON.parse(credentials));
      setIsAuthenticated(true);
      if (pathname === '/login') {
        router.push('/dashboard');
      }
    } else if (pathname !== '/login') {
      router.push('/login');
    }
  }, [router, pathname]);

  const login = async (credentials: SupabaseCredentials): Promise<boolean> => {
    try {
      const success = await APIService.verifyCredentials(credentials);
      if (success) {
        localStorage.setItem('credentials', JSON.stringify(credentials));
        setIsAuthenticated(true);
        router.push('/dashboard');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('credentials');
    setIsAuthenticated(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 