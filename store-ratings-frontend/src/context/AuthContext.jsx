// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Password validation regex (8-16 chars, at least 1 uppercase and 1 special)
const passwordRegex = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

function makeId(prefix = "u") {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}

// Demo seed users (ONLY for frontend demo; DO NOT use in production)
const DEMO_USERS = [
  {
    id: makeId("u"),
    name: "Administrator Account Name",
    email: "admin@example.com",
    password: "Admin@123", // demo only
    address: "HQ, Main Street, City",
    role: "ADMIN",
  },
  {
    id: makeId("u"),
    name: "Store Owner Full Name Demo",
    email: "owner@example.com",
    password: "Owner@123",
    address: "Market Road 1, City",
    role: "STORE_OWNER",
  },
  {
    id: makeId("u"),
    name: "Normal User Demo Account XX",
    email: "user@example.com",
    password: "User@1234",
    address: "Block 1, Neighborhood, City",
    role: "NORMAL",
  },
];

export function AuthProvider({ children }) {
  // load users from localStorage or seed
  const [users, setUsers] = useState(() => {
    try {
      const raw = localStorage.getItem("sr_users");
      if (raw) return JSON.parse(raw);
    } catch {}
    // seed demo users
    localStorage.setItem("sr_users", JSON.stringify(DEMO_USERS));
    return DEMO_USERS;
  });

  // current logged-in user object (without password)
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("sr_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    // persist users and current user
    try {
      localStorage.setItem("sr_users", JSON.stringify(users));
    } catch {}
  }, [users]);

  useEffect(() => {
    try {
      if (user) localStorage.setItem("sr_user", JSON.stringify(user));
      else localStorage.removeItem("sr_user");
    } catch {}
  }, [user]);

  // register a new normal user (frontend demo)
  function register({ name, email, password, address }) {
    // validations per spec
    if (typeof name !== "string" || name.trim().length < 20 || name.trim().length > 60) {
      return { ok: false, error: "Name must be between 20 and 60 characters." };
    }
    if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
      return { ok: false, error: "Invalid email address." };
    }
    if (typeof address === "string" && address.length > 400) {
      return { ok: false, error: "Address max length is 400 characters." };
    }
    if (typeof password !== "string" || !passwordRegex.test(password)) {
      return { ok: false, error: "Password must be 8-16 chars, include 1 uppercase and 1 special character." };
    }
    // check unique email
    const exists = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { ok: false, error: "Email already registered." };
    }

    const newUser = {
      id: makeId("u"),
      name: name.trim(),
      email: email.toLowerCase(),
      password, // DEMO: storing plaintext for client-side demo only
      address: (address || "").trim(),
      role: "NORMAL",
    };

    setUsers((s) => [...s, newUser]);
    // auto-login after register (optional)
    const safeUser = { id: newUser.id, name: newUser.name, email: newUser.email, address: newUser.address, role: newUser.role };
    setUser(safeUser);
    return { ok: true, user: safeUser };
  }

  // login (email + password)
  function login({ email, password }) {
    if (!email || !password) return { ok: false, error: "Email and password are required." };
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!found) return { ok: false, error: "User not found." };
    if (found.password !== password) return { ok: false, error: "Incorrect password." };

    const safeUser = { id: found.id, name: found.name, email: found.email, address: found.address, role: found.role };
    setUser(safeUser);
    return { ok: true, user: safeUser };
  }

  // logout
  function logout() {
    setUser(null);
  }

  // update password (simple demo)
  function updatePassword({ userId, currentPassword, newPassword }) {
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) return { ok: false, error: "User not found." };
    if (users[idx].password !== currentPassword) return { ok: false, error: "Current password incorrect." };
    if (!passwordRegex.test(newPassword)) return { ok: false, error: "New password must be 8-16 chars, include 1 uppercase and 1 special character." };

    const updated = [...users];
    updated[idx] = { ...updated[idx], password: newPassword };
    setUsers(updated);
    return { ok: true };
  }

  return (
    <AuthContext.Provider value={{ user, users, register, login, logout, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}
