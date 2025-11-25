import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  user_id: number;
  username: string;
  role: string;
}

/**
 * Hook to get current user's role from JWT token
 * Returns role and loading state
 */
export function useRoleCheck() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('jwt_token');
    
    if (!token) {
      setLoading(false);
      router.push('/admin/login');
      return;
    }

    try {
      const decoded = jwtDecode<JWTPayload>(token);
      setRole(decoded.role);
      setLoading(false);
    } catch (error) {
      // Invalid token, redirect to login
      setLoading(false);
      router.push('/admin/login');
    }
  }, [router]);

  return { role, loading };
}

// Default export for compatibility
export default useRoleCheck;
