import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "../api/authAPi";
import { useAuth } from "../context/AuthContext";
import see from "./../assets/see.ico";
import unsee from "./../assets/unsee.ico";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Maintainable state
  // User Email
  const [email, setEmail] = useState("");
  //User Password
  const [password, setPassword] = useState("");
  // Showing and hiding password
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // form submit Error handeled here
  const [error, setError] = useState("");

  // Submit handler (This function runs when the form is submitted)
  const handleSubmit = async (e) => {
    //Stop default browser behavior
    e.preventDefault();
    //Reset old errors
    setError("");
    // Disables the login button, Changes text to "Logging in...", Prevents multiple submissions
    setLoading(true);

    try {
      // loginApi sends { email, password } to backend,
      //await pauses execution until server responds
      //res = backend response (usually Axios response)
      const res = await loginApi({ email, password });
      // Store auth data (token and user) in local storage (This function is from AuthContext)
      login(res.data.token, res.data.user);
      // Redirecting to the dashboard after right credentials
      // console.log(res.data.user);
      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      // Setting the Error message if happen any
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-linear-to-br from-indigo-100 to-blue-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md"
      >
        <h2 className="text-3xl font-bold mb-2 text-center text-gray-800">
          Welcome back
        </h2>
        <p className="text-center text-gray-500 mb-6">Login to your account</p>

        {/* The actual Error message on the Login form */}
        {error && (
          <div className="mb-4 rounded bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Taking Email from User */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Email
          </label>
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
            // Showing the email on the form
            value={email}
            // Setting the email
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        {/* Taking Password from User */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
              // Showing the password on the Form
              value={password}
              //Setting the password
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {/* Button To 'see' and 'unsee' the password */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
            >
              {/* The image of eyes */}
              <img
                src={showPassword ? unsee : see}
                alt={showPassword ? "Hide password" : "Show password"}
                className="w-5 h-5"
              />
            </button>
          </div>
        </div>

        {/* Submitting the Login from  */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-indigo-600 py-2.5 text-white font-medium hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-300 transition disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an Account?{" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="text-indigo-600 font-medium hover:underline"
          >
            Sign up
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;
