import { useEffect, useState } from "react";
import {
  getAllReports,
  dismissReport,
  reviewReport,
} from "../../api/reportApi";
import { Link } from "react-router-dom";
import Toast from "../../components/Toast";

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Filters
  const [statusFilter, setStatusFilter] = useState("pending");
  const [reasonFilter, setReasonFilter] = useState("");

  useEffect(() => {
    fetchReports();
  }, [statusFilter, reasonFilter]);

  const fetchReports = async () => {
    setLoading(true);

    try {
      const res = await getAllReports({
        status: statusFilter || undefined,
        reason: reasonFilter || undefined,
      });

      setReports(res.data.reports);
    } catch (err) {
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = async (reportId) => {
    try {
      await dismissReport(reportId, {
        note: "No violation found",
      });

      setToastMessage("Report dismissed successfully");
      setToastType("success");
      setShowToast(true);

      fetchReports();
    } catch (err) {
      setToastMessage(
        err.response?.data?.message || "Failed to dismiss report",
      );
      setToastType("error");
      setShowToast(true);
    }
  };

  const handleReview = async (reportId) => {
    try {
      await reviewReport(reportId, {
        deletionReason: "violation",
        note: "Post removed after review",
      });

      setToastMessage("Post deleted and report marked as reviewed");
      setToastType("success");
      setShowToast(true);

      fetchReports();
    } catch (err) {
      setToastMessage(err.response?.data?.message || "Failed to review report");
      setToastType("error");
      setShowToast(true);
    }
  };

  const getReasonBadge = (reason) => {
    const styles = {
      spam: "bg-yellow-100 text-yellow-700",
      abuse: "bg-red-100 text-red-700",
      illegal: "bg-purple-100 text-purple-700",
      harassment: "bg-orange-100 text-orange-700",
      misinformation: "bg-blue-100 text-blue-700",
      other: "bg-gray-100 text-gray-700",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          styles[reason] || styles.other
        }`}
      >
        {reason}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-amber-100 text-amber-700",
      reviewed: "bg-emerald-100 text-emerald-700",
      dismissed: "bg-gray-100 text-gray-600",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          styles[status]
        }`}
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
            <h1 className="text-3xl font-bold text-gray-900">Manage Reports</h1>

            <p className="text-gray-600 mt-1">
              Review and take action on reported posts
            </p>
          </div>

          <Link
            to="/admin"
            className="flex items-center gap-2 text-indigo-600 hover:underline text-sm"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 flex flex-col sm:flex-row gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none bg-white"
          >
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="dismissed">Dismissed</option>
          </select>

          <select
            value={reasonFilter}
            onChange={(e) => setReasonFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none bg-white"
          >
            <option value="">All Reasons</option>
            <option value="spam">Spam</option>
            <option value="abuse">Abuse</option>
            <option value="illegal">Illegal</option>
            <option value="harassment">Harassment</option>
            <option value="misinformation">Misinformation</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Reports */}
        {loading ? (
          <p className="text-center mt-10">Loading reports...</p>
        ) : error ? (
          <p className="text-center mt-10 text-red-600">{error}</p>
        ) : reports.length === 0 ? (
          <p className="text-center mt-10 text-gray-500">No reports found</p>
        ) : (
          <div className="grid gap-4">
            {reports.map((report) => (
              <div
                key={report._id}
                className="bg-white rounded-xl shadow p-6 space-y-4"
              >
                {/* Report Header */}
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getReasonBadge(report.reason)}
                      {getStatusBadge(report.status)}
                    </div>

                    <p className="text-xs text-gray-500">
                      Reported on{" "}
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Actions */}
                  {report.status === "pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDismiss(report._id)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                      >
                        Dismiss
                      </button>

                      <button
                        onClick={() => handleReview(report._id)}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition"
                      >
                        Delete Post
                      </button>
                    </div>
                  )}
                </div>

                {/* Post Info */}
                {report.post && (
                  <Link to={`/posts/${report.post._id}`} className="block">
                    <div className="bg-gray-50 rounded-lg p-4 hover:bg-indigo-50 transition cursor-pointer border border-transparent hover:border-indigo-200">
                      <p className="text-xs text-gray-500 mb-1">
                        Reported Post — click to view
                      </p>

                      <p className="font-medium text-gray-900 hover:text-indigo-600 transition">
                        {report.post.title}
                      </p>

                      {report.post.excerpt && (
                        <p className="text-sm text-gray-600 mt-1">
                          {report.post.excerpt}
                        </p>
                      )}

                      {report.post.author && (
                        <p className="text-xs text-gray-500 mt-2">
                          By {report.post.author.fullName} (
                          {report.post.author.email})
                        </p>
                      )}
                    </div>
                  </Link>
                )}

                {/* Reporter Info */}
                <div className="flex items-center gap-3">
                  <img
                    src={
                      report.reportedBy?.image ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt={report.reportedBy?.fullName}
                    className="w-8 h-8 rounded-full object-cover"
                  />

                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {report.reportedBy?.fullName}
                    </p>

                    <p className="text-xs text-gray-500">
                      {report.reportedBy?.email}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {report.description && (
                  <div className="bg-amber-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">
                      Reporter's Note
                    </p>

                    <p className="text-sm text-gray-700">
                      {report.description}
                    </p>
                  </div>
                )}

                {/* Review Note */}
                {report.reviewNote && (
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Admin Note</p>

                    <p className="text-sm text-gray-700">{report.reviewNote}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
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

export default AdminReports;
