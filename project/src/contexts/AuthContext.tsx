import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import type { Profile } from '@/types';

interface AuthUser { id: string; email: string; }
interface AuthSession { access_token: string; user: AuthUser; }
interface AuthContextValue {
  session: AuthSession | null;
  user: AuthUser | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  fetchProfileWithRetry: (userId: string, attempts?: number) => Promise<Profile | null>;
}
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await api.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) { console.warn('Failed to fetch profile:', error.message); return null; }
    setProfile(data as Profile | null);
    return data as Profile | null;
  }
  async function fetchProfileWithRetry(userId: string, attempts = 5) {
    for (let i = 0; i < attempts; i++) {
      const result = await fetchProfile(userId);
      if (result) return result;
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    return null;
  }
  useEffect(() => {
    let mounted = true;
    api.auth.getSession().then(async ({ data: { session: nextSession } }) => {
      if (!mounted) return;
      setSession(nextSession);
      if (nextSession?.user) await fetchProfile(nextSession.user.id);
      if (mounted) setLoading(false);
    }).catch(() => { if (mounted) setLoading(false); });
    const { data: listener } = api.auth.onAuthStateChange((_event: string, nextSession: AuthSession | null) => {
      if (!mounted) return;
      setSession(nextSession);
      if (nextSession?.user) void fetchProfile(nextSession.user.id).finally(() => setLoading(false));
      else { setProfile(null); setLoading(false); }
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);
  async function signOut() { await api.auth.signOut(); setSession(null); setProfile(null); }
  async function refreshProfile() { if (session?.user) await fetchProfile(session.user.id); }
  const value: AuthContextValue = { session, user: session?.user ?? null, profile, loading, isAdmin: profile?.role === 'admin', signOut, refreshProfile, fetchProfileWithRetry };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
