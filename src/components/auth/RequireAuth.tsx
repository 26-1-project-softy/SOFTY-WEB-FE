import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface RequireAuthProps {
  children: React.ReactElement;
  redirectTo: string;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children, redirectTo }) => {
  const location = useLocation();
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return children;
};

export default RequireAuth;

