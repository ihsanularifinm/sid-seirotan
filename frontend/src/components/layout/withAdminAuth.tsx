'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const withAdminAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const Wrapper = (props: P) => {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
      let isAuthorized = false;
      const userRole = Cookies.get('user_role');
      if (userRole === 'admin' || userRole === 'superadmin') {
        isAuthorized = true;
      } else {
        router.push('/admin/login');
      }
      setTimeout(() => setIsAuthorized(isAuthorized), 0);
    }, [router]);

    if (!isAuthorized) {
      return null; // Or a loading spinner
    }

    return <WrappedComponent {...props} />;
  };

  return Wrapper;
};

export default withAdminAuth;
