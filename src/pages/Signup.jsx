import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup as signupApi } from "../api/authAPi";
import see from "./../assets/see.ico";
import unsee from "./../assets/unsee.ico";
import Toast from "../components/Toast";

const Signup = () => {
  const navigate = useNavigate();

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success"); // success or error

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call signup API
      await signupApi({ fullName, email, password, image });

      // Show success toast
      setToastMessage("Signup successful! ");
      setToastType("success");
      setShowToast(true);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      // Show error toast
      const errorMsg = err.response?.data?.message || "Something went wrong";
      setToastMessage(errorMsg);
      setToastType("error");
      setShowToast(true);
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-100 to-indigo-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">
          Create Account
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Join us and start blogging!
        </p>

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Full Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Full Name
          </label>
          <input
            type="text"
            placeholder="John Doe"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="you@email.com"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={5}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
            >
              <img
                src={showPassword ? unsee : see}
                alt={showPassword ? "Hide password" : "Show password"}
                className="w-5 h-5"
              />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Minimum 5 characters</p>
        </div>

        {/* Profile Image URL */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Profile Image URL
          </label>
          <input
            type="url"
            placeholder="https://example.com/image.jpg"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
            value={image}
            onChange={(e) => setImage(e.target.value)}
          />
          {/* <p className="text-xs text-gray-500 mt-1">
            Leave empty for default avatar
          </p> */}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-indigo-600 py-2.5 text-white font-medium hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition disabled:opacity-60"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-indigo-600 font-medium hover:underline"
          >
            Log in
          </button>
        </p>
      </form>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
          type={toastType}
        />
      )}
    </div>
  );
};

export default Signup;
