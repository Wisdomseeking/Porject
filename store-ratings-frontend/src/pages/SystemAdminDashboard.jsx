import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://localhost:5000/api";

const SystemAdminDashboard = () => {
  const navigate = useNavigate();

  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [totalRatings, setTotalRatings] = useState(0);

  const [storeFilter, setStoreFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [storeSort, setStoreSort] = useState({ field: "name", order: "asc" });
  const [userSort, setUserSort] = useState({ field: "name", order: "asc" });

  const [showStoreModal, setShowStoreModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [editingUser, setEditingUser] = useState(null);

  const [storeForm, setStoreForm] = useState({ name: "", email: "", address: "" });
  const [userForm, setUserForm] = useState({ name: "", email: "", address: "", password: "", role: "Normal User" });

  // Fetch data
  useEffect(() => {
    fetchStores();
    fetchUsers();
    fetchTotalRatings();
  }, []);

  const fetchStores = async () => {
    try {
      const res = await axios.get(`${API_BASE}/stores`);
      setStores(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching stores");
    }
  };

 const fetchUsers = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.get(`${API_BASE}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setUsers(res.data);
  } catch (err) {
    console.error(err);
    alert("Error fetching users");
  }
};


  const fetchTotalRatings = async () => {
    try {
      const res = await axios.get(`${API_BASE}/ratings`);
      setTotalRatings(res.data.length);
    } catch (err) {
      console.error(err);
      setTotalRatings(0);
    }
  };

  // Sorting
  const sortData = (data, sort) => {
    const { field, order } = sort;
    return [...data].sort((a, b) => {
      if (a[field] < b[field]) return order === "asc" ? -1 : 1;
      if (a[field] > b[field]) return order === "asc" ? 1 : -1;
      return 0;
    });
  };

  const toggleStoreSort = (field) =>
    setStoreSort({ field, order: storeSort.field === field && storeSort.order === "asc" ? "desc" : "asc" });

  const toggleUserSort = (field) =>
    setUserSort({ field, order: userSort.field === field && userSort.order === "asc" ? "desc" : "asc" });

  const filteredStores = sortData(
    stores.filter(
      (s) =>
        s.name.toLowerCase().includes(storeFilter.toLowerCase()) ||
        s.email.toLowerCase().includes(storeFilter.toLowerCase()) ||
        s.address.toLowerCase().includes(storeFilter.toLowerCase())
    ),
    storeSort
  );

  const filteredUsers = sortData(
    users.filter(
      (u) =>
        u.name.toLowerCase().includes(userFilter.toLowerCase()) ||
        u.email.toLowerCase().includes(userFilter.toLowerCase()) ||
        u.address.toLowerCase().includes(userFilter.toLowerCase()) ||
        u.role.toLowerCase().includes(userFilter.toLowerCase())
    ),
    userSort
  );

  // Validation
  const validateStore = () => {
    const { name, email, address } = storeForm;
    if (!name || !email || !address) return "All fields are required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Invalid email format";
    return null;
  };

  const validateUser = () => {
    const { name, email, address, password } = userForm;
    if (!name || !email || !address) return "All fields are required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Invalid email format";
    if (!editingUser && (!password || password.length < 6)) return "Password required, min 6 chars";
    return null;
  };

  // CRUD handlers
  const handleStoreSubmit = async () => {
    const error = validateStore();
    if (error) return alert(error);
    try {
      if (editingStore) {
        const res = await axios.put(`${API_BASE}/stores/${editingStore.id}`, { ...storeForm, ownerId: 1, role: "admin" });
        setStores(stores.map((s) => (s.id === editingStore.id ? res.data : s)));
      } else {
        const res = await axios.post(`${API_BASE}/stores`, { ...storeForm, ownerId: 1 });
        setStores([...stores, res.data]);
      }
      setShowStoreModal(false);
      setStoreForm({ name: "", email: "", address: "" });
      setEditingStore(null);
    } catch (err) {
      console.error(err);
      alert("Error saving store!");
    }
  };

  const handleUserSubmit = async () => {
    const error = validateUser();
    if (error) return alert(error);
    try {
      if (editingUser) {
        const res = await axios.put(`${API_BASE}/users/${editingUser.id}`, userForm);
        setUsers(users.map((u) => (u.id === editingUser.id ? res.data : u)));
      } else {
        const res = await axios.post(`${API_BASE}/auth/signup`, userForm);
        setUsers([...users, res.data]);
      }
      setShowUserModal(false);
      setUserForm({ name: "", email: "", address: "", password: "", role: "Normal User" });
      setEditingUser(null);
    } catch (err) {
      console.error(err);
      alert("Error saving user!");
    }
  };

  const handleDeleteStore = async (id) => {
    if (!window.confirm("Are you sure you want to delete this store?")) return;
    try {
      await axios.delete(`${API_BASE}/stores/${id}`, { data: { ownerId: 1, role: "admin" } });
      setStores(stores.filter((s) => s.id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting store!");
    }
  };

  const handleDeleteUser = async (id) => {
  if (!window.confirm("Are you sure you want to delete this user?")) return;
  try {
    const token = localStorage.getItem("token"); 
    await axios.delete(`${API_BASE}/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setUsers(users.filter((u) => u.id !== id));
  } catch (err) {
    console.error(err);
    alert("Error deleting user!");
  }
};


 

  return (
    <div className="p-6 bg-bgLight min-h-screen font-poppins">
      <h1 className="text-3xl font-bold mb-6 text-primary">System Administrator Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 shadow-card rounded-xl text-center">
          <div className="text-lg font-semibold text-gray-600">Total Users</div>
          <div className="text-2xl font-bold text-primary">{users.length}</div>
        </div>
        <div className="bg-white p-6 shadow-card rounded-xl text-center">
          <div className="text-lg font-semibold text-gray-600">Total Stores</div>
          <div className="text-2xl font-bold text-primary">{stores.length}</div>
        </div>
        <div className="bg-white p-6 shadow-card rounded-xl text-center">
          <div className="text-lg font-semibold text-gray-600">Total Ratings</div>
          <div className="text-2xl font-bold text-primary">{totalRatings}</div>
        </div>
      </div>

      {/* Stores Table */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-secondary">Stores</h2>
        <div className="flex justify-between items-center mb-3">
          <input
            type="text"
            placeholder="Search stores..."
            className="border border-gray-300 rounded px-3 py-2 w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-secondary"
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
          />
          <button
            className="ml-2 bg-secondary text-white px-4 py-2 rounded-xl hover:bg-primary transition"
            onClick={() => setShowStoreModal(true)}
          >
            Add Store
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 shadow-sm rounded-xl">
            <thead className="bg-primary text-white">
              <tr>
                {["name", "email", "address", "rating"].map((field) => (
                  <th key={field} className="p-3 cursor-pointer" onClick={() => toggleStoreSort(field)}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                    {storeSort.field === field ? (storeSort.order === "asc" ? " ↑" : " ↓") : ""}
                  </th>
                ))}
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStores.map((store, index) => (
                <tr key={store.id} className={index % 2 === 0 ? "bg-white" : "bg-bgLight"}>
                  <td className="p-3 border">{store.name}</td>
                  <td className="p-3 border">{store.email}</td>
                  <td className="p-3 border">{store.address}</td>
                  <td className="p-3 border">{store.rating}</td>
                  <td className="p-3 border">
                    <button
                      className="bg-warning text-white px-3 py-1 rounded-xl mr-2 hover:bg-yellow-600 transition"
                      onClick={() => {
                        setEditingStore(store);
                        setStoreForm({ name: store.name, email: store.email, address: store.address });
                        setShowStoreModal(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-danger text-white px-3 py-1 rounded-xl hover:bg-red-600 transition"
                      onClick={() => handleDeleteStore(store.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Table */}
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-4 text-secondary">Users</h2>
        <div className="flex justify-between items-center mb-3">
          <input
            type="text"
            placeholder="Search users..."
            className="border border-gray-300 rounded px-3 py-2 w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-secondary"
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
          />
          <button
            className="ml-2 bg-secondary text-white px-4 py-2 rounded-xl hover:bg-primary transition"
            onClick={() => setShowUserModal(true)}
          >
            Add User
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 shadow-sm rounded-xl">
            <thead className="bg-primary text-white">
              <tr>
                {["name", "email", "address", "role"].map((field) => (
                  <th key={field} className="p-3 cursor-pointer" onClick={() => toggleUserSort(field)}>
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                    {userSort.field === field ? (userSort.order === "asc" ? " ↑" : " ↓") : ""}
                  </th>
                ))}
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user.id} className={index % 2 === 0 ? "bg-white" : "bg-bgLight"}>
                  <td className="p-3 border">{user.name}</td>
                  <td className="p-3 border">{user.email}</td>
                  <td className="p-3 border">{user.address}</td>
                  <td className="p-3 border">{user.role}</td>
                  <td className="p-3 border">
                    <button
                      className="bg-warning text-white px-3 py-1 rounded-xl mr-2 hover:bg-yellow-600 transition"
                      onClick={() => {
                        setEditingUser(user);
                        setUserForm({
                          name: user.name,
                          email: user.email,
                          address: user.address,
                          password: "",
                          role: user.role,
                        });
                        setShowUserModal(true);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-danger text-white px-3 py-1 rounded-xl hover:bg-red-600 transition"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showStoreModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-modal w-96">
            <h2 className="text-xl font-semibold mb-4">{editingStore ? "Edit Store" : "Add Store"}</h2>
            <input
              type="text"
              placeholder="Name"
              className="border px-3 py-2 mb-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary"
              value={storeForm.name}
              onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="border px-3 py-2 mb-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary"
              value={storeForm.email}
              onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
            />
            <textarea
              placeholder="Address"
              className="border px-3 py-2 mb-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary"
              value={storeForm.address}
              onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
            />
            <div className="flex justify-end mt-4">
              <button
                className="bg-gray-300 px-4 py-2 rounded-xl mr-2 hover:bg-gray-400 transition"
                onClick={() => {
                  setShowStoreModal(false);
                  setEditingStore(null);
                  setStoreForm({ name: "", email: "", address: "" });
                }}
              >
                Cancel
              </button>
              <button
                className="bg-secondary text-white px-4 py-2 rounded-xl hover:bg-primary transition"
                onClick={handleStoreSubmit}
              >
                {editingStore ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-modal w-96">
            <h2 className="text-xl font-semibold mb-4">{editingUser ? "Edit User" : "Add User"}</h2>
            <input
              type="text"
              placeholder="Name"
              className="border px-3 py-2 mb-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary"
              value={userForm.name}
              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="border px-3 py-2 mb-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary"
              value={userForm.email}
              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
            />
            <textarea
              placeholder="Address"
              className="border px-3 py-2 mb-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary"
              value={userForm.address}
              onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
            />
            {!editingUser && (
              <input
                type="password"
                placeholder="Password"
                className="border px-3 py-2 mb-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
              />
            )}
            <select
              className="border px-3 py-2 mb-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-secondary"
              value={userForm.role}
              onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
            >
              <option value="Normal User">Normal User</option>
              <option value="Admin">Admin</option>
              <option value="Store Owner">Store Owner</option>
            </select>
            <div className="flex justify-end mt-4">
              <button
                className="bg-gray-300 px-4 py-2 rounded-xl mr-2 hover:bg-gray-400 transition"
                onClick={() => {
                  setShowUserModal(false);
                  setEditingUser(null);
                  setUserForm({ name: "", email: "", address: "", password: "", role: "Normal User" });
                }}
              >
                Cancel
              </button>
              <button
                className="bg-secondary text-white px-4 py-2 rounded-xl hover:bg-primary transition"
                onClick={handleUserSubmit}
              >
                {editingUser ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SystemAdminDashboard;
