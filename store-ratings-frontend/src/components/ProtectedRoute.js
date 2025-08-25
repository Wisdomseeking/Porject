// src/components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return <Navigate to="/login" />;

  // Convert both stored role and allowedRoles to camel case for comparison
  const userRole = user.role.replace(/\s+/g, "");
  const allowedCamelRoles = allowedRoles.map(r => r.replace(/\s+/g, ""));

  if (!allowedCamelRoles.includes(userRole)) {
    return <Navigate to="/" />;
  }

  return children;
};
export default ProtectedRoute;
