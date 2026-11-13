import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword } from "../api/authAPi";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await forgotPassword({ email });
      setSent(true);
    } catch (err) {
      const data = err.response?.data;
      setError(
        data?.errors?.[0]?.message || data?.message || "Something went wrong",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-100 to-blue-200 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        {sent ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-3 text-gray-800">
              Check your email
            </h2>
            <p className="text-gray-600 mb-6">
              If an account with <span className="font-semibold">{email}</span>{" "}
              exists, we've sent a password reset link. It expires in 15
              minutes.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Didn't get it? Check your spam folder, or wait a minute and try
              again.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full rounded-md bg-indigo-600 py-2.5 text-white font-medium hover:bg-indigo-700 transition"
            >
              Back to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">
              Forgot password?
            </h2>
            <p className="text-center text-gray-500 mb-6">
              Enter your email and we'll send you a reset link.
            </p>

            {error && (
              <div className="mb-4 rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-indigo-600 py-2.5 text-white font-medium hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <p className="text-center text-sm text-gray-600 mt-4">
              Remembered it?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-indigo-600 font-medium hover:underline"
              >
                Back to login
              </button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
