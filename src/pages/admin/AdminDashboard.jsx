import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats } from "../../api/adminApi";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getDashboardStats();
        setStats(res.data);
      } catch (err) {
        setError("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading dashboard...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-6xl mx-auto px-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Overview of your platform</p>
        </div>

        {/* User Stats */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Users</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total Users"
              value={stats.users.total}
              color="bg-indigo-500"
            />
            <StatCard
              label="Active"
              value={stats.users.active}
              color="bg-emerald-500"
            />
            <StatCard
              label="Suspended"
              value={stats.users.suspended}
              color="bg-amber-500"
            />
            <StatCard
              label="Banned"
              value={stats.users.banned}
              color="bg-red-500"
            />
          </div>
        </div>

        {/* Post Stats */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Posts</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard
              label="Total Posts"
              value={stats.posts.total}
              color="bg-blue-500"
            />
            <StatCard
              label="Published"
              value={stats.posts.published}
              color="bg-emerald-500"
            />
            <StatCard
              label="Deleted"
              value={stats.posts.deleted}
              color="bg-red-500"
            />
          </div>
        </div>

        {/* Quick Nav */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Manage</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              to="/admin/users"
              className="bg-white rounded-xl p-6 shadow hover:shadow-md transition text-center"
            >
              <p className="text-lg font-semibold text-indigo-600">
                Manage Users
              </p>
              <p className="text-sm text-gray-500 mt-1">
                View, suspend or ban users
              </p>
            </Link>
            <Link
              to="/admin/posts"
              className="bg-white rounded-xl p-6 shadow hover:shadow-md transition text-center"
            >
              <p className="text-lg font-semibold text-indigo-600">
                Manage Posts
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Delete or restore posts
              </p>
            </Link>
            <Link
              to="/admin/reports"
              className="bg-white rounded-xl p-6 shadow hover:shadow-md transition text-center"
            >
              <p className="text-lg font-semibold text-indigo-600">
                Manage Reports
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Review reported posts
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

// Small reusable stat card
const StatCard = ({ label, value, color }) => (
  <div className={`${color} rounded-xl p-5 text-white shadow`}>
    <p className="text-sm opacity-80">{label}</p>
    <h3 className="text-3xl font-bold mt-1">{value}</h3>
  </div>
);

export default AdminDashboard;
