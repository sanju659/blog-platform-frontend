import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  // Get token and logout from context
  const { token, logout, user } = useAuth();

  //Logout clears token from Local Storage
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  return (
    <nav className="sticky top-0 z-50 border-b bg-linear-to-r from-indigo-600 to-blue-600">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-white">
          BlogSpace
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-4">
          <Link to="/" className="text-indigo-100 hover:text-white">
            Home
          </Link>

          {!token ? (
            <>
              <Link to="/login" className="text-indigo-100 hover:text-white">
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-1 border border-white text-white rounded hover:bg-white hover:text-indigo-600 transition"
              >
                Signup
              </Link>
            </>
          ) : (
            <>
              {user?.role === "admin" ? (
                <Link to="/admin" className="text-indigo-100 hover:text-white">
                  Admin
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="text-indigo-100 hover:text-white"
                >
                  Dashboard
                </Link>
              )}
              <Link to="/profile" className="text-indigo-100 hover:text-white">
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-1 border border-white text-white rounded hover:bg-white hover:text-indigo-600 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Hamburger Button */}
        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {/* The  ☰ (hamburger) icon */}
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            {open ? (
              // Close icon (❌)
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              // Hamburger icon (☰)
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-linear-to-r from-indigo-600 to-blue-600 border-t border-indigo-400 px-4 pb-3">
          <Link
            to="/"
            className="block py-2 text-indigo-100 hover:text-white"
            onClick={() => setOpen(false)}
          >
            Home
          </Link>

          {!token ? (
            <>
              <Link
                to="/login"
                className="block py-2 text-indigo-100 hover:text-white"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="block py-2 text-indigo-100 hover:text-white"
                onClick={() => setOpen(false)}
              >
                Signup
              </Link>
            </>
          ) : (
            <>
              {user?.role === "admin" ? (
                <Link
                  to="/admin"
                  className="block py-2 text-indigo-100 hover:text-white"
                  onClick={() => setOpen(false)}
                >
                  Admin
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="block py-2 text-indigo-100 hover:text-white"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              <Link
                to="/profile"
                className="block py-2 text-indigo-100 hover:text-white"
                onClick={() => setOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block py-2 text-left w-full text-indigo-100 hover:text-white"
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
