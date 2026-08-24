import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { getPostById } from "../../api/postApi";
import { softDeletePost, restorePost } from "../../api/adminApi";
import MediaCarousel from "../../components/MediaCarousel";
import AdminDeleteModal from "../../components/AdminDeleteModal";
import ConfirmModal from "../../components/ConfirmModal";
import Toast from "../../components/Toast";
import { FiTrash2, FiRotateCcw, FiCheck } from "react-icons/fi";
import { FaArrowLeft } from "react-icons/fa";
import { dismissReport, reviewReport } from "../../api/reportApi";

const AdminPostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Present only when we arrived here from a specific report (Manage Reports page)
  const reportId = location.state?.reportId || null;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDismissModal, setShowDismissModal] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const res = await getPostById(id);
      setPost(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load post");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConfirm = async (reason) => {
    try {
      if (reportId) {
        // Came from a report — review + delete via the report flow,
        // this also marks all pending reports on this post as reviewed
        await reviewReport(reportId, {
          deletionReason: reason,
          note: "Post removed after review",
        });
      } else {
        // Came from Manage Posts directly — plain admin delete
        await softDeletePost(id, { reason });
      }

      setToastMessage("Post deleted successfully");
      setToastType("success");
      setShowToast(true);
      setShowDeleteModal(false);
      fetchPost();
    } catch (err) {
      setToastMessage(err.response?.data?.message || "Failed to delete post");
      setToastType("error");
      setShowToast(true);
      setShowDeleteModal(false);
    }
  };

  const handleRestore = async () => {
    try {
      await restorePost(id);
      setToastMessage("Post restored successfully");
      setToastType("success");
      setShowToast(true);
      fetchPost();
    } catch (err) {
      setToastMessage(err.response?.data?.message || "Failed to restore post");
      setToastType("error");
      setShowToast(true);
    }
  };

  const handleDismissConfirm = async () => {
    try {
      await dismissReport(reportId, { note: "No violation found" });
      setToastMessage("Report dismissed successfully");
      setToastType("success");
      setShowToast(true);
      setShowDismissModal(false);

      // Nothing to review anymore, send admin back to the reports list
      setTimeout(() => {
        navigate("/admin/reports");
      }, 1200);
    } catch (err) {
      setToastMessage(err.response?.data?.message || "Failed to dismiss report");
      setToastType("error");
      setShowToast(true);
      setShowDismissModal(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading post...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-600">{error}</p>;
  }

  if (!post) {
    return <p className="text-center mt-10">Post not found</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-4xl mx-auto px-6 mb-4 flex justify-between items-center">
        <Link
          to={reportId ? "/admin/reports" : "/admin/posts"}
          className="flex items-center gap-2 text-indigo-600 hover:underline text-sm"
        >
          <FaArrowLeft /> {reportId ? "Back to Manage Reports" : "Back to Manage Posts"}
        </Link>

        {post.isDeleted && (
          <span className="bg-red-100 text-red-600 text-xs px-3 py-1 rounded-full font-semibold">
            Deleted
          </span>
        )}
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {post.media?.length > 0 && (
          <div className="px-8 pt-8 md:px-10 md:pt-10">
            <div className="rounded-xl overflow-hidden">
              <MediaCarousel media={post.media} />
            </div>
          </div>
        )}

        <div className="p-8 md:p-10">
          {post.category && (
            <span className="inline-block mb-4 bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full text-sm font-semibold tracking-wide">
              {post.category}
            </span>
          )}

          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 mb-10">
            <img
              src={post.author.image}
              alt={post.author.fullName}
              className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-100"
            />
            <div>
              <p className="font-semibold text-gray-900">
                {post.author.fullName}
              </p>
              <p className="text-sm text-gray-500">{post.author.email}</p>
              <p className="text-sm text-gray-500">
                {new Date(post.publishedAt || post.createdAt).toDateString()}
              </p>
            </div>
          </div>

          <article className="prose prose-lg prose-indigo max-w-none">
            <p className="whitespace-pre-wrap leading-relaxed text-gray-700">
              {post.content}
            </p>
          </article>

          {/* Admin actions */}
          <div className="flex gap-4 mt-12 pt-6 border-t flex-wrap">
            {!post.isDeleted ? (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 active:scale-95 transition"
              >
                <FiTrash2 /> Delete Post
              </button>
            ) : (
              <button
                onClick={handleRestore}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 active:scale-95 transition"
              >
                <FiRotateCcw /> Restore Post
              </button>
            )}

            {/* Only show Dismiss when we arrived here from a specific pending report */}
            {reportId && (
              <button
                onClick={() => setShowDismissModal(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 active:scale-95 transition"
              >
                <FiCheck /> Dismiss Report
              </button>
            )}
          </div>
        </div>
      </div>

      <AdminDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        postTitle={post?.title}
      />

      <ConfirmModal
        isOpen={showDismissModal}
        onClose={() => setShowDismissModal(false)}
        onConfirm={handleDismissConfirm}
        title="Dismiss Report"
        message="This will mark the report as dismissed with no action taken on the post. Are you sure?"
        confirmLabel="Dismiss"
        confirmColor="bg-gray-700 hover:bg-gray-800"
        iconBg="bg-gray-100"
        iconColor="text-gray-600"
      />

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

export default AdminPostDetails;