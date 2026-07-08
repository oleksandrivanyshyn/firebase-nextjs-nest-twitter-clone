'use client';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthCtx {
  user: User | null;
  loading: boolean;
  needsEmailVerification: boolean;
}
const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  needsEmailVerification: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  const needsEmailVerification = !!user?.email && !user.emailVerified;

  return (
    <AuthContext.Provider value={{ user, loading, needsEmailVerification }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuthContext = () => useContext(AuthContext);
