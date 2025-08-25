import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import SystemAdminDashboard from "./pages/SystemAdminDashboard";
import UserDashboard from "./pages/UserDashboard.jsx";
import LandingPage from "./pages/Landingpage.jsx";
import StoreOwnerDashboard from "./pages/StoreOwnerDashboard.jsx";
// Helper component for protected routes
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    // Not logged in
    return <Navigate to="/" />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Role not allowed
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<LandingPage />} />

        {/* Admin-only Signup */}
        <Route
          path="/signup"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <Signup />
            </ProtectedRoute>
          }
        />

        {/* System Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <SystemAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Normal User */}
        <Route
          path="/user"
          element={
            <ProtectedRoute allowedRoles={["Normal User"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />

        {/* Store Owner */}
        <Route
          path="/store"
          element={
            <ProtectedRoute allowedRoles={["Store Owner"]}>
              <StoreOwnerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
