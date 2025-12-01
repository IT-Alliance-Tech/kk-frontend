"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { getProfile as apiGetProfile, logout as backendLogout } from "@/lib/api/auth.api";
import type { Profile } from "@/lib/supabase";

interface UnifiedUser {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: UnifiedUser | null;
  profile: Profile | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  token: null,
  loading: true,
  isAdmin: false,
  refreshUser: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<UnifiedUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const isAdmin = !!user && (user.role === "admin" || (user as any).isAdmin);

  const loadBackendProfile = useCallback(async (theToken?: string | null) => {
    setLoading(true);
    try {
      const t = theToken ?? (typeof window !== "undefined" ? localStorage.getItem("token") : null);
      if (!t) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      const backendProfile = await apiGetProfile();
      if (backendProfile) {
        setUser(backendProfile as UnifiedUser);
        setToken(t);
      } else {
        setUser(null);
        setToken(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
    } catch (e) {
      console.error("Error loading backend profile:", e);
      setUser(null);
      setToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSupabaseProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase.auth.getUser();
      const supaUser = data?.user ?? null;
      if (!supaUser) {
        setProfile(null);
        setUser(null);
      } else {
        setProfile(null);
        if (!localStorage.getItem("token")) {
          const unified: UnifiedUser = {
            id: supaUser.id,
            name: (supaUser.user_metadata as any)?.full_name || (supaUser.user_metadata as any)?.name || "",
            email: supaUser.email ?? "",
            role: "user",
          };
          setUser(unified);
          setToken(null);
        }
      }
    } catch (e) {
      console.error("Supabase profile error:", e);
      setProfile(null);
      if (!localStorage.getItem("token")) setUser(null);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const refreshUser = useCallback(async () => {
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (storedToken) {
      await loadBackendProfile(storedToken);
    } else {
      await loadSupabaseProfile();
    }
  }, [loadBackendProfile, loadSupabaseProfile]);

  useEffect(() => {
    (async () => {
      try {
        const storedToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (storedToken) {
          await loadBackendProfile(storedToken);
        } else {
          await loadSupabaseProfile();
        }
      } catch (e) {
        console.error("Auth init error:", e);
      } finally {
        setLoading(false);
      }
    })();

    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();
          setProfile(profileData ?? null);
        } catch (e) {
          setProfile(null);
        }
      } else {
        setProfile(null);
        if (!localStorage.getItem("token")) {
          setUser(null);
        }
      }
      setLoading(false);
    });

    const onStorage = (ev: StorageEvent) => {
      if (ev.key === "token" || ev.key === "user") {
        const val = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (val) {
          loadBackendProfile(val);
        } else {
          setToken(null);
          setUser(null);
        }
      }
    };
    window.addEventListener("storage", onStorage);

    return () => {
      data?.subscription?.unsubscribe?.();
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const logout = useCallback(async () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch (e) {}
    }

    try {
      backendLogout();
    } catch (e) {}

    try {
      await supabase.auth.signOut().catch(() => {});
    } catch (e) {}

    setToken(null);
    setUser(null);
    setProfile(null);

    if (typeof window !== "undefined") {
      window.location.replace("/login");
    }
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        token,
        loading,
        isAdmin,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
