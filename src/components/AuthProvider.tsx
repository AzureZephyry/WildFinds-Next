"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

interface AuthContextValue {
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const client = supabase;

    if (!client) {
      const timer = window.setTimeout(() => setIsLoading(false), 0);
      return () => window.clearTimeout(timer);
    }

    let active = true;

    const loadSession = async () => {
      const {
        data: { session: currentSession },
        error,
      } = await client.auth.getSession();

      if (!active) {
        return;
      }

      if (error) {
        console.error("[WildFinds] Auth session lookup failed", error);
      }

      setSession(currentSession);
      setIsLoading(false);
    };

    void loadSession();

    const { data: authListener } = client.auth.onAuthStateChange((_event, nextSession) => {
      if (!active) {
        return;
      }

      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isLoading,
      signOut: async () => {
        if (!supabase) {
          return { error: new Error("Supabase is not configured.") };
        }

        const { error } = await supabase.auth.signOut();
        return { error };
      },
    }),
    [isLoading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
