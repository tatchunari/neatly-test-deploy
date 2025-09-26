import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface AuthContextType {
  user: any;
  loading: boolean;
  anonymousId: string | null;
  isGuest: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Generate or retrieve anonymous ID from localStorage
const getOrCreateAnonymousId = (): string => {
  if (typeof window === 'undefined') return '';
  
  let anonId = localStorage.getItem('neatly_anonymous_id');
  if (!anonId) {
    // Generate a UUID v4
    anonId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    localStorage.setItem('neatly_anonymous_id', anonId);
  }
  return anonId;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [anonymousId, setAnonymousId] = useState<string | null>(null);

  useEffect(() => {
    // Initialize anonymous ID
    const anonId = getOrCreateAnonymousId();
    console.log('🔑 AuthContext: Initialized anonymous ID:', anonId);
    setAnonymousId(anonId);

    const loadSession = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    loadSession();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // Handle session linking when user logs in
      if (event === 'SIGNED_IN' && session?.user && anonId) {
        try {
          // Link guest session to user account
          await fetch('/api/chat/link-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ anonymousId: anonId })
          });
          console.log('Guest session linked to user account');
          
          // Clear anonymous ID after successful linking
          localStorage.removeItem('neatly_anonymous_id');
          setAnonymousId(null);
        } catch (error) {
          console.error('Error linking guest session:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        // Clear user data and regenerate anonymous ID
        setUser(null);
        const newAnonId = getOrCreateAnonymousId();
        setAnonymousId(newAnonId);
      }
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const isGuest = !user && !!anonymousId;
  
  console.log('🔍 AuthContext state:', { 
    user: !!user, 
    userId: user?.id,
    anonymousId, 
    isGuest, 
    loading,
    authStatus: user ? 'authenticated' : (anonymousId ? 'guest' : 'none')
  });

  return (
    <AuthContext.Provider value={{ user, loading, anonymousId, isGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);