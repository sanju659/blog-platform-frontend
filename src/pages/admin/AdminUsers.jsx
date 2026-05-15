import { useEffect, useState } from "react";
import { getAllUsers, updateUserStatus } from "../../api/adminApi";
import { Link } from "react-router-dom";
import Toast from "../../components/Toast";
import { FaArrowLeft } from "react-icons/fa";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  // this useEffect hook calling the fetchUsers() function according to changes
  useEffect(() => {
    fetchUsers();
  }, [statusFilter, search]);

  // This function fetching users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getAllUsers({
        status: statusFilter || undefined,
        search: search || undefined,
      });
      setUsers(res.data.users);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Status change handler function
  const handleStatusChange = async (userId, newStatus) => {
    try {
      await updateUserStatus(userId, { status: newStatus });
      setToastMessage(`User ${newStatus} successfully`);
      setToastType("success");
      setShowToast(true);
      fetchUsers(); // Refresh list
    } catch (err) {
      setToastMessage(err.response?.data?.message || "Failed to update status");
      setToastType("error");
      setShowToast(true);
    }
  };

  // function to render status with specific color
  const getStatusBadge = (status) => {
    const styles = {
      active: "bg-emerald-100 text-emerald-700",
      suspended: "bg-amber-100 text-amber-700",
      banned: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status]}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-6xl mx-auto px-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
            <p className="text-gray-600 mt-1">View and manage user accounts</p>
          </div>
          <Link to="/admin" className="flex items-center gap-2 text-indigo-600 hover:underline text-sm">
            <FaArrowLeft /> Back to Dashboard
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 flex flex-col sm:flex-row gap-4">
          {/* Input field */}
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
          />

          {/* Select Menu */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none bg-white"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>

        {/* Users Table */}
        {loading ? (
          <p className="text-center mt-10">Loading users...</p>
        ) : error ? (
          <p className="text-center mt-10 text-red-600">{error}</p>
        ) : users.length === 0 ? (
          <p className="text-center mt-10 text-gray-500">No users found</p>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 text-left">User</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Role</th>
                  <th className="px-6 py-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* image of the user */}
                        <img
                          src={user.image}
                          alt={user.fullName}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        {/* Full name of the user */}
                        <span className="font-medium text-gray-800">
                          {user.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4">{getStatusBadge(user.status)}</td>
                    <td className="px-6 py-4 text-gray-600 capitalize">
                      {user.role}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {/* Button to activate user */}
                        {user.status !== "active" && (
                          <button
                            onClick={() =>
                              handleStatusChange(user._id, "active")
                            }
                            className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-200 transition"
                          >
                            Activate
                          </button>
                        )}
                        {/* Button to suspend user */}
                        {user.status !== "suspended" && (
                          <button
                            onClick={() =>
                              handleStatusChange(user._id, "suspended")
                            }
                            className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-medium hover:bg-amber-200 transition"
                          >
                            Suspend
                          </button>
                        )}
                        {/* Button to ban user */}
                        {user.status !== "banned" && (
                          <button
                            onClick={() =>
                              handleStatusChange(user._id, "banned")
                            }
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-medium hover:bg-red-200 transition"
                          >
                            Ban
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

export default AdminUsers;
