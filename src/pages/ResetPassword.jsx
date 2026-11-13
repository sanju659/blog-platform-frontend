import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resetPassword } from "../api/authAPi";
import Toast from "../components/Toast";
import see from "./../assets/see.ico";
import unsee from "./../assets/unsee.ico";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [linkInvalid, setLinkInvalid] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 5) {
      setError("Password must be at least 5 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, { newPassword });
      setShowToast(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const data = err.response?.data;
      const message =
        data?.errors?.[0]?.message || data?.message || "Something went wrong";

      // 400 on a bad/expired token -> offer to request a new link
      if (err.response?.status === 400 && /invalid or expired/i.test(message)) {
        setLinkInvalid(true);
      } else {
        setError(message);
      }
      setLoading(false);
    }
  };

  if (linkInvalid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-100 to-blue-200 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
          <h2 className="text-3xl font-bold mb-3 text-gray-800">
            Link expired
          </h2>
          <p className="text-gray-600 mb-6">
            This reset link is invalid or has expired. Reset links can only be
            used once and last 15 minutes.
          </p>
          <button
            onClick={() => navigate("/forgot-password")}
            className="w-full rounded-md bg-indigo-600 py-2.5 text-white font-medium hover:bg-indigo-700 transition"
          >
            Request a new link
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-100 to-blue-200 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">
          Set new password
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Choose a new password for your account.
        </p>

        {error && (
          <div className="mb-4 rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* New password */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            New Password
          </label>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              placeholder="••••••••"
              className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={5}
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute inset-y-0 right-2 flex items-center"
            >
              <img
                src={showNew ? unsee : see}
                alt={showNew ? "Hide password" : "Show password"}
                className="w-5 h-5"
              />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">Minimum 5 characters</p>
        </div>

        {/* Confirm password */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 right-2 flex items-center"
            >
              <img
                src={showConfirm ? unsee : see}
                alt={showConfirm ? "Hide password" : "Show password"}
                className="w-5 h-5"
              />
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || showToast}
          className="w-full rounded-md bg-indigo-600 py-2.5 text-white font-medium hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition disabled:opacity-60"
        >
          {loading ? "Updating..." : "Reset Password"}
        </button>
      </form>

      {showToast && (
        <Toast
          message="Password changed! Redirecting to login..."
          onClose={() => setShowToast(false)}
          type="success"
        />
      )}
    </div>
  );
};

export default ResetPassword;
