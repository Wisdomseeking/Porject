import React from "react";
import { useNavigate } from "react-router-dom";
import { FaUserShield, FaStore, FaUser, FaSearch, FaStar, FaChartLine } from "react-icons/fa";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const goToDashboard = () => {
    if (!user) return;
    if (user.role === "Admin") navigate("/admin");
    else if (user.role === "Store Owner") navigate("/store");
    else navigate("/user");
  };

  const handleRoleClick = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col font-poppins bg-gray-50">
      {/* Hero Section */}
      <section className="hero relative flex flex-col items-center justify-center text-center text-white py-32 px-6 overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fadeIn">
          Welcome to RateMaster
        </h1>
        <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto animate-fadeIn delay-200">
          Discover, rate, and review your favorite stores. Your opinions shape the community!
        </p>
        {user && (
          <button
            onClick={goToDashboard}
            className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-xl hover:bg-gray-100 transition duration-300 animate-fadeIn delay-300"
          >
            Go to Dashboard
          </button>
        )}
      </section>

      {/* App Purpose Section */}
      <section className="py-20 px-6 text-center">
        <h2 className="text-4xl font-bold mb-6 text-gray-800 animate-fadeIn">
          What is RateMaster?
        </h2>
        <p className="text-lg md:text-xl max-w-3xl mx-auto text-gray-700 animate-fadeIn delay-200">
          RateMaster is a platform where you can explore stores, provide honest ratings, and see what the community thinks.
          Whether you're a store owner, administrator, or a reviewer, RateMaster helps you stay connected and make better decisions.
        </p>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 text-center bg-white">
        <h2 className="text-4xl font-bold mb-12 text-gray-800 animate-fadeIn">
          Key Features
        </h2>
        <div className="features-grid">
          {[
            { icon: <FaSearch />, title: "Discover Stores", desc: "Easily find your favorite stores and explore new ones.", color: "from-blue-400 to-blue-600" },
            { icon: <FaStar />, title: "Rate & Review", desc: "Share honest ratings and reviews to help others.", color: "from-yellow-400 to-yellow-500" },
            { icon: <FaChartLine />, title: "Track Ratings", desc: "See store ratings and your contributions at a glance.", color: "from-green-400 to-green-600" },
          ].map((feature, idx) => (
            <div key={idx} className={`feature-card bg-gradient-to-r ${feature.color} text-white p-8 rounded-2xl shadow-xl transform transition hover:scale-105 cursor-default animate-fadeIn delay-${300 + idx * 100}`}>
              <div className="feature-icon mb-4 text-5xl">{feature.icon}</div>
              <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Role Selection Cards */}
      <section className="roles-section py-20 text-center">
        <h2 className="section-title text-4xl font-bold mb-12 text-gray-800 animate-fadeIn">
          Choose Your Role
        </h2>
        <div className="roles-grid">
          {[
            { title: "Administrator", desc: "Manage users, stores, and oversee ratings.", icon: <FaUserShield />, gradient: "from-blue-500 to-blue-700" },
            { title: "Store Owner", desc: "Manage your stores and track ratings.", icon: <FaStore />, gradient: "from-green-400 to-green-600" },
            { title: "Reviewer", desc: "Discover stores, rate them, and share honest reviews.", icon: <FaUser />, gradient: "from-purple-500 to-purple-700" },
          ].map((role, idx) => (
            <div
              key={idx}
              className={`role-card bg-gradient-to-r ${role.gradient} text-white p-8 rounded-2xl shadow-xl transform transition duration-300 hover:scale-105 cursor-pointer animate-fadeIn delay-${500 + idx * 100}`}
              onClick={handleRoleClick}
            >
              <div className="role-icon mb-4 animate-bounce">{role.icon}</div>
              <h3 className="text-2xl font-bold mb-2">{role.title}</h3>
              <p>{role.desc}</p>
              <div className="mt-2 flex justify-center">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-300 text-xl animate-pulse">★</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 text-center">
        &copy; {new Date().getFullYear()} RateMaster. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
