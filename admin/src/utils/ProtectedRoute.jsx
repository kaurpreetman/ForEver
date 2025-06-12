import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, isAllowed }) => {
  return isAllowed ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;