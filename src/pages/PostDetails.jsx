import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPostById, deletePost } from "../api/postApi";
import { useAuth } from "../context/AuthContext";
import { FiEdit, FiTrash2, FiAlertTriangle } from "react-icons/fi";
import DeleteModal from "../components/DeleteModal";
import Toast from "../components/Toast";
import ReportModal from "../components/ReportModal";
import ImageCarousel from "../components/ImageCarousel";

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showToast, setShowToast] = useState(false); // Toast state (it is the msg that shows that the post is deleted)
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await getPostById(id);
        setPost(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // This function is deleting the post if user confirmed to delete it
  const handleDeleteConfirm = async () => {
    try {
      await deletePost(id);
      setShowDeleteModal(false);
      setShowToast(true); // Show toast (it is the msg that shows that the post is deleted)

      // Navigate after showing the toast (i.e. the post is deleted) after 1.5 second
      setTimeout(() => {
        navigate("/my-posts");
      }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete post");
      setShowDeleteModal(false);
    }
  };

  // Handling editing post
  const handleEdit = () => {
    navigate(`/edit-post/${id}`);
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

  const isAuthor = user && user.id === post.author._id;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {post.images?.length > 0 && (
          <div className="px-8 pt-8 md:px-10 md:pt-10">
            <div className="rounded-xl overflow-hidden">
              <ImageCarousel images={post.images} />
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

          {/* The conditional rendering to show 'edit' and 'delete' 
          button to the user who is the creator of the post otherwise don't show */}
          {isAuthor && (
            <div className="flex gap-4 mt-12 pt-6 border-t">
              <button
                onClick={handleEdit}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 active:scale-95 transition"
              >
                <FiEdit /> Edit Post
              </button>

              {/* When it is clicked the delete modal is shown */}
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 active:scale-95 transition"
              >
                <FiTrash2 /> Delete
              </button>
            </div>
          )}

          {/* Show report button to logged-in non-authors */}
          {user && !isAuthor && user.role !== "admin" && (
            <button
              onClick={() => setShowReportModal(true)}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 active:scale-95 transition"
            >
              <FiAlertTriangle /> Report
            </button>
          )}

          {/* Report Modal */}
          <ReportModal
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
            postId={id}
          />
        </div>
      </div>

      {/* Here is the custom delete modal to confirm deletion */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        postTitle={post?.title}
      />

      {/* Success Toast (That the post is deleted successfully) */}
      {showToast && (
        <Toast
          message="Post deleted successfully!"
          onClose={() => setShowToast(false)}
          type="success"
        />
      )}
    </div>
  );
};

export default PostDetails;
