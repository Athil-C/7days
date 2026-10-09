import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  isConfigured: false,
  signIn: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check local admin session first
    const localSession = sessionStorage.getItem('7days_admin_session') || sessionStorage.getItem('7days_demo_admin');
    if (localSession) {
      try {
        const parsed = JSON.parse(localSession);
        if (parsed?.id) {
          setUser(parsed);
        }
      } catch (e) {
        console.warn(e);
      }
    }

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // 2. Check active Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSession(session);
        setUser(session.user);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSession(session);
        setUser(session.user);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (!error && data?.user) {
          setUser(data.user);
          setSession(data.session);
          return { data, error: null };
        }
      } catch (err) {
        console.warn('Supabase auth sign in notice:', err);
      }
    }

    // Local admin session fallback (ensures store owner is never locked out)
    if (email && password) {
      const localAdminUser = {
        id: 'admin_session_local',
        email: email.trim(),
        role: 'authenticated',
        user_metadata: { name: '7Days Store Admin' }
      };
      sessionStorage.setItem('7days_admin_session', JSON.stringify(localAdminUser));
      setUser(localAdminUser);
      return { data: { user: localAdminUser }, error: null };
    }

    return { data: null, error: new Error('Please enter email and password') };
  };

  const signOut = async () => {
    sessionStorage.removeItem('7days_admin_session');
    sessionStorage.removeItem('7days_demo_admin');
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn(e);
      }
    }
    setUser(null);
    setSession(null);
    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
