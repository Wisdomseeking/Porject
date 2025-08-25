import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const API_BASE = "http://localhost:5000/api";
const PAGE_SIZE = 6;

export default function UserDashboard() {
  const navigate = useNavigate();

  // Auth/User
  const [user, setUser] = useState(null);

  // Sidebar state
  const [activeTab, setActiveTab] = useState("browse");

  // Stores + Ratings
  const [stores, setStores] = useState([]);
  const [overallRatings, setOverallRatings] = useState({});
  const [ratings, setRatings] = useState({});
  const [userRatingsList, setUserRatingsList] = useState([]);

  // Browse controls
  const [search, setSearch] = useState("");
  const [sortByRating, setSortByRating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Profile edit
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    address: "",
    password: "",
  });

  const [updatedUser, setUpdatedUser] = useState({
    username: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
  });

  // ---------- Auth bootstrap ----------
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      navigate("/login");
      return;
    }
    setUser(storedUser);
    setProfileForm({
      name: storedUser.name || "",
      email: storedUser.email || "",
      address: storedUser.address || "",
      password: "",
    });
    setUpdatedUser({
      username: storedUser.username || storedUser.name || "",
      email: storedUser.email || "",
    });
  }, [navigate]);

  // ---------- Initial data fetch ----------
  useEffect(() => {
    if (!user?.id) return;
    fetchStores();
    fetchUserRatings(user.id);
  }, [user]);

  // ---------- API calls ----------
  const fetchStores = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stores`);
      setStores(res.data || []);
      fetchOverallRatings();
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch stores");
    }
  };

  const fetchUserRatings = async (userId) => {
    try {
      const res = await axios.get(`${API_BASE}/ratings/${userId}`);
      const list = res.data || [];
      setUserRatingsList(list);
      const map = {};
      list.forEach((r) => {
        map[r.store_id] = r.rating;
      });
      setRatings(map);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOverallRatings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/ratings`);
      const storeSum = {};
      const storeCount = {};
      (res.data || []).forEach((r) => {
        if (!storeSum[r.store_id]) {
          storeSum[r.store_id] = 0;
          storeCount[r.store_id] = 0;
        }
        storeSum[r.store_id] += Number(r.rating || 0);
        storeCount[r.store_id] += 1;
      });
      const avg = {};
      Object.keys(storeSum).forEach((sid) => {
        avg[sid] = (storeSum[sid] / storeCount[sid]).toFixed(1);
      });
      setOverallRatings(avg);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRatingChange = async (storeId, rating) => {
    if (!user?.id) return;
    try {
      await axios.post(`${API_BASE}/ratings`, {
        userId: user.id,
        storeId,
        rating,
      });
      setRatings((prev) => ({ ...prev, [storeId]: rating }));
      fetchOverallRatings();
      fetchUserRatings(user.id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit rating");
    }
  };

  const handleRemoveRating = async (storeId) => {
    if (!user?.id) return;
    try {
      await axios.delete(`${API_BASE}/ratings/${user.id}/${storeId}`);
      setRatings((prev) => {
        const copy = { ...prev };
        delete copy[storeId];
        return copy;
      });
      fetchOverallRatings();
      fetchUserRatings(user.id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove rating");
    }
  };

  // ---------- Profile ----------
  const handleProfileUpdate = async () => {
    if (!user?.id) return;
    try {
      const payload = {
        name: profileForm.name,
        email: profileForm.email,
        address: profileForm.address,
      };
      if (profileForm.password?.trim()) {
        payload.password = profileForm.password;
      }
      const res = await axios.put(`${API_BASE}/users/${user.id}`, payload);
      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
      setEditMode(false);
      toast.success("Profile updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    if (!window.confirm("Are you sure you want to delete your account?")) return;
    try {
      await axios.delete(`${API_BASE}/users/${user.id}`);
      localStorage.removeItem("user");
      navigate("/signup");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete account");
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // ---------- Derived (browse) ----------
  const filteredStores = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = (stores || []).filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.address?.toLowerCase().includes(q)
    );
    if (!sortByRating) return list;
    return list.sort((a, b) => {
      const ra = parseFloat(overallRatings[a.id] || 0);
      const rb = parseFloat(overallRatings[b.id] || 0);
      return rb - ra;
    });
  }, [stores, search, sortByRating, overallRatings]);

  const totalPages = Math.max(1, Math.ceil(filteredStores.length / PAGE_SIZE));
  const paginatedStores = filteredStores.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // ---------- Helpers ----------
  const userDisplayName =
    user?.name || user?.username || user?.email || "User";

  const findStoreName = (storeId) =>
    stores.find((s) => s.id === storeId)?.name || `Store #${storeId}`;

  // ---------- UI ----------
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <aside className="w-72 bg-white/90 backdrop-blur border-r border-gray-200 shadow-sm flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold shadow">
              R
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-gray-800 tracking-tight">
                RateMaster
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">User Portal</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { key: "browse", label: "Browse Stores" },
            { key: "dashboard", label: "Profile" },
            { key: "reviews", label: "My Reviews" },
            { key: "settings", label: "Settings" },
          ].map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full text-left px-4 py-2.5 rounded-lg transition font-medium ${
                activeTab === item.key
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight text-gray-900">
            Welcome, {userDisplayName} 👋
          </h1>
          <p className="text-gray-500 mt-1">
            Glad to have you back. Rate fairly, help the community.
          </p>
        </div>


        {/* ---- BROWSE STORES ---- */}
        {activeTab === "browse" && (
          <>
            {/* Search + Sort */}
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <input
                type="text"
                placeholder="Search stores by name or address"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full sm:w-2/3 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              />
              <button
                onClick={() => setSortByRating((v) => !v)}
                className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow-sm"
              >
                {sortByRating ? "Clear Sorting" : "Sort by Rating"}
              </button>
            </div>

            {/* Store Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedStores.map((store) => (
                <div
                  key={store.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        {store.name}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {store.address}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Overall</div>
                      <div className="text-xl font-extrabold text-gray-900">
                        {overallRatings[store.id] || "0.0"} <span className="text-yellow-400">★</span>
                      </div>
                    </div>
                  </div>

                  {/* Your rating control */}
                  <div className="mt-4">
                    <div className="text-sm text-gray-600 mb-2">
                      Your Rating:
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          onClick={() => handleRatingChange(store.id, num)}
                          className={`h-9 w-9 rounded-lg border text-sm font-semibold transition ${
                            ratings[store.id] === num
                              ? "bg-yellow-400 text-white border-yellow-400"
                              : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                          }`}
                          title={`Rate ${num}`}
                        >
                          {num}
                        </button>
                      ))}
                      {ratings[store.id] && (
                        <button
                          onClick={() => handleRemoveRating(store.id)}
                          className="px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="px-3 py-1.5 bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                disabled={currentPage === 1}
              >
                Prev
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                className="px-3 py-1.5 bg-gray-200 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* ---- PROFILE (Dashboard) ---- */}
        {activeTab === "dashboard" && (
          <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
            <h2 className="text-xl font-bold mb-4">Profile</h2>

            {editMode ? (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Name"
                  value={profileForm.name}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, name: e.target.value })
                  }
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={profileForm.email}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, email: e.target.value })
                  }
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={profileForm.address}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, address: e.target.value })
                  }
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <input
                  type="password"
                  placeholder="New Password (optional)"
                  value={profileForm.password}
                  onChange={(e) =>
                    setProfileForm({ ...profileForm, password: e.target.value })
                  }
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleProfileUpdate}
                    className="px-5 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-5 py-3 bg-gray-400 text-white rounded-xl hover:bg-gray-500 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <span className="font-semibold">Name:</span> {user?.name || "Not provided"}
                  </p>
                  <p>
                    <span className="font-semibold">Email:</span> {user?.email || "Not provided"}
                  </p>
                  <p>
                    <span className="font-semibold">Role:</span>{" "}
                    <span className="capitalize">{user?.role || "Normal User"}</span>
                  </p>
                  <p>
                    <span className="font-semibold">Address:</span> {user?.address || "Not provided"}
                  </p>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setEditMode(true)}
                    className="px-5 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-5 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---- MY REVIEWS ---- */}
        {activeTab === "reviews" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Your Ratings & Reviews</h2>
            {userRatingsList.length === 0 ? (
              <div className="p-4 text-gray-500 italic bg-white rounded-xl border">
                You haven't rated any stores yet.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {userRatingsList.map((r) => (
                  <div
                    key={`${r.user_id}-${r.store_id}`}
                    className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition"
                  >
                    <div className="font-semibold text-gray-900">
                      {findStoreName(r.store_id)}
                    </div>
                    <div className="text-gray-600 mt-1">
                      Your rating:{" "}
                      <span className="font-bold text-gray-900">{r.rating}</span>{" "}
                      <span className="text-yellow-400">★</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-sm text-gray-500 mr-2">Update:</span>
                      {[1, 2, 3, 4, 5].map((num) => (
                        <button
                          key={num}
                          onClick={() => handleRatingChange(r.store_id, num)}
                          className={`h-8 w-8 rounded-md border text-sm font-semibold transition ${
                            r.rating === num
                              ? "bg-yellow-400 text-white border-yellow-400"
                              : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                          }`}
                          title={`Rate ${num}`}
                        >
                          {num}
                        </button>
                      ))}
                      <button
                        onClick={() => handleRemoveRating(r.store_id)}
                        className="ml-auto px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
{/* ---- SETTINGS ---- */}
{activeTab === "settings" && (
  <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 text-gray-600">
    <h2 className="text-xl font-bold mb-4">Account Settings</h2>

    {/* Update Profile */}
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              username: updatedUser.username,
              email: updatedUser.email,
            }),
          });

          if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || "Update failed");
          }

          toast.success("Profile updated successfully");
        } catch (err) {
          toast.error(err.message);
        }
      }}
      className="space-y-4 mb-8"
    >
      {/* Username */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Username</label>
        <input
          type="text"
          value={updatedUser.username}
          onChange={(e) =>
            setUpdatedUser({ ...updatedUser, username: e.target.value })
          }
          className="w-full mt-1 p-2 border rounded-lg"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={updatedUser.email}
          onChange={(e) =>
            setUpdatedUser({ ...updatedUser, email: e.target.value })
          }
          className="w-full mt-1 p-2 border rounded-lg"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700"
      >
        Save Changes
      </button>
    </form>

    {/* Change Password */}
    <div>
      <h3 className="text-lg font-semibold mb-3">Change Password</h3>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
         const res = await fetch(
  `http://localhost:5000/api/users/change-password/me`,
  {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify({
      oldPassword: passwordData.oldPassword,
      newPassword: passwordData.newPassword,
    }),
  }
);


            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error || "Password update failed");
            }

            toast.success("Password updated successfully");
            setPasswordData({ oldPassword: "", newPassword: "" });
          } catch (err) {
            toast.error(err.message);
          }
        }}
        className="space-y-4"
      >
        {/* Old Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Old Password</label>
          <input
            type="password"
            value={passwordData.oldPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, oldPassword: e.target.value })
            }
            className="w-full mt-1 p-2 border rounded-lg"
          />
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700">New Password</label>
          <input
            type="password"
            value={passwordData.newPassword}
            onChange={(e) =>
              setPasswordData({ ...passwordData, newPassword: e.target.value })
            }
            className="w-full mt-1 p-2 border rounded-lg"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
        >
          Update Password
        </button>
      </form>
    </div>
  </div>
)}

 </main>
    </div>
  );
}
