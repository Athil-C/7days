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
    // Purge any legacy fake admin tokens from storage
    try {
      sessionStorage.removeItem('7days_admin_session');
      sessionStorage.removeItem('7days_demo_admin');
    } catch {}

    if (!isSupabaseConfigured) {
      console.warn('Supabase is not configured. Admin authentication requires Supabase.');
      setLoading(false);
      return;
    }

    // 1. Check active Supabase authenticated session
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          setSession(session);
          setUser(session.user);
        } else {
          setSession(null);
          setUser(null);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Supabase getSession notice:', err);
        setSession(null);
        setUser(null);
        setLoading(false);
      });

    // 2. Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSession(session);
        setUser(session.user);
      } else {
        setSession(null);
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const cleanEmail = (email || '').trim();
    const cleanPassword = password || '';

    if (!cleanEmail || !cleanPassword) {
      return { data: null, error: new Error('Please enter both email and password.') };
    }

    if (!isSupabaseConfigured) {
      return {
        data: null,
        error: new Error('Supabase authentication is not configured in environment variables.')
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        return { data: null, error };
      }

      if (data?.user) {
        setUser(data.user);
        setSession(data.session);
        return { data, error: null };
      }

      return { data: null, error: new Error('Authentication failed. No user returned.') };
    } catch (err) {
      console.error('Supabase signIn error:', err);
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    try {
      sessionStorage.removeItem('7days_admin_session');
      sessionStorage.removeItem('7days_demo_admin');
    } catch {}

    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error:', e);
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
