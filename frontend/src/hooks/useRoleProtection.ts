'use client';

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
 * Hook to protect pages from unauthorized role access
 * Redirects author users to /admin/news
 * 
 * @param allowedRoles - Array of roles that can access the page
 * @param redirectTo - Where to redirect unauthorized users (default: /admin/news)
 */
export function useRoleProtection(
  allowedRoles: string[] = ['admin', 'superadmin'],
  redirectTo: string = '/admin/news'
) {
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
      const userRole = decoded.role;
      setRole(userRole);
      setLoading(false);

      // Check if user's role is in allowed roles
      if (!allowedRoles.includes(userRole)) {
        console.log(`Access denied: ${userRole} not in [${allowedRoles.join(', ')}]`);
        router.replace(redirectTo);
      }
    } catch (error) {
      // Invalid token, redirect to login
      setLoading(false);
      router.push('/admin/login');
    }
  }, [router, allowedRoles, redirectTo]);

  // Return safe values - if loading or no role, consider not allowed
  const isAllowed = role ? allowedRoles.includes(role) : false;
  
  return { role, loading, isAllowed };
}
