import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = () => {
    logout();
    nav("/login");
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/stores" className="font-bold text-xl">StoreRatings</Link>

        <div className="flex items-center gap-3">
          <Link to="/stores" className="text-sm">Stores</Link>
          {user?.role === "ADMIN" && <Link to="/admin/dashboard" className="text-sm">Admin</Link>}
          {user?.role === "STORE_OWNER" && <Link to="/owner/dashboard" className="text-sm">Owner</Link>}
          {!user ? (
            <>
              <Link to="/login" className="btn btn-sm px-3 py-1 border rounded">Login</Link>
            </>
          ) : (
            <>
              <span className="text-sm mr-2">Hi, {user.name}</span>
              <button onClick={handleLogout} className="text-sm text-red-600">Logout</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
