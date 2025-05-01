import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface AuthContextProps {
  user: User | null;
  loading: boolean;
  signOutUser: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  signOutUser: async () => {},
  signIn: async () => {},
});

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('getSession hatası:', error.message);
        }
        if (data?.session?.user) {
          setUser(data.session.user);
        }
      } catch (error) {
        console.error('getSession yakalama hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setLoading(false);
      }
      if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOutUser = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear(); // Eğer supabase auth dışında başka şeyler de varsa ayrı ayrı silebilirsin.
      setUser(null);
      toast.success('Çıkış yapıldı.');
    } catch (error) {
      console.error('Çıkış hatası:', error);
      toast.error('Çıkış yapılamadı.');
    }
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Login error:', error.message);
      throw new Error(error.message);
    }
    if (data?.user) {
      setUser(data.user);
    } else {
      throw new Error("Giriş başarısız.");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOutUser, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export default function useAuth() {
  return useContext(AuthContext);
}

export { AuthProvider };
