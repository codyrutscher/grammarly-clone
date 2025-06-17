import { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { onAuthStateChange } from '../utils/firebaseUtils';

export function useAuthProvider() {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);
} 