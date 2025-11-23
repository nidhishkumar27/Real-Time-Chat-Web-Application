import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token, user } = useAuthStore();
  
  console.log('[ProtectedRoute] Checking auth:', { isAuthenticated, hasToken: !!token, hasUser: !!user });
  
  if (!isAuthenticated || !token || !user) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;

