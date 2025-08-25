// src/pages/OwnerDashboard.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";

// === Sidebar Component ===
const Sidebar = ({ onLogout }) => {
  return (
    <div className="w-64 h-screen bg-gray-900 text-white flex flex-col p-4">
      <h2 className="text-xl font-bold mb-6">Store Owner</h2>
      <nav className="flex flex-col space-y-4 mb-4">
        <Link to="stores" className="hover:text-yellow-400">Manage Stores</Link>
        <Link to="ratings" className="hover:text-yellow-400">Store Ratings</Link>
        <Link to="summary" className="hover:text-yellow-400">Summary</Link>
      </nav>
      <button
        onClick={onLogout}
        className="mt-auto px-3 py-2 rounded bg-red-500 hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );
};

// === Manage Stores Page ===
const ManageStores = () => {
  const [stores, setStores] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user || user.role !== "Store Owner") {
      navigate("/");
      return;
    }
    axios
      .get(`http://localhost:5000/api/stores/owner/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setStores(res.data))
      .catch((err) => console.error(err));
  }, [navigate, user, token]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">My Stores</h2>
      <ul className="space-y-3">
        {stores.map((store) => (
          <li key={store.id} className="border p-4 rounded-lg shadow">
            <h3 className="font-bold">{store.name}</h3>
            <p>{store.description}</p>
            <p className="text-sm text-gray-500">📍 {store.location}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

// === Store Ratings Page ===
const StoreRatings = () => {
  const [ratings, setRatings] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user || user.role !== "Store Owner") {
      navigate("/");
      return;
    }
    axios
      .get(`http://localhost:5000/api/owners/${user.id}/ratings`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setRatings(res.data))
      .catch((err) => console.error(err));
  }, [navigate, user, token]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Store Ratings</h2>
      {ratings.length === 0 ? (
        <p>No ratings yet.</p>
      ) : (
        <ul className="space-y-3">
          {ratings.map((rating) => (
            <li key={rating.id} className="border p-4 rounded-lg shadow">
              ⭐ {rating.rating} — {rating.comment}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// === Store Summary Page ===
const StoreSummary = () => {
  const [summary, setSummary] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!user || user.role !== "Store Owner") {
      navigate("/");
      return;
    }
    axios
      .get(`http://localhost:5000/api/owners/${user.id}/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSummary(res.data))
      .catch((err) => console.error(err));
  }, [navigate, user, token]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Store Summary</h2>
      <ul className="space-y-3">
        {summary.map((store) => (
          <li key={store.store_id} className="border p-4 rounded-lg shadow">
            <h3 className="font-bold">{store.store_name}</h3>
            <p>Total Ratings: {store.total_ratings}</p>
            <p>Average Rating: {store.avg_rating}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

// === Dashboard Layout ===
const OwnerDashboard = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="flex">
      <Sidebar onLogout={logout} />
      <main className="flex-1 bg-gray-100 min-h-screen">
        <Routes>
          <Route path="/" element={<Navigate to="stores" />} />
          <Route path="stores" element={<ManageStores />} />
          <Route path="ratings" element={<StoreRatings />} />
          <Route path="summary" element={<StoreSummary />} />
        </Routes>
      </main>
    </div>
  );
};

export default OwnerDashboard;
