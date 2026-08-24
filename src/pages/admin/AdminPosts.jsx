import { useEffect, useState } from "react";
import {
  getAllPostsAdmin,
  // softDeletePost,
  // restorePost,
} from "../../api/adminApi";
import { Link } from "react-router-dom";
import Toast from "../../components/Toast";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const AdminPosts = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Filters
  const [isDeletedFilter, setIsDeletedFilter] = useState("false");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPosts();
  }, [isDeletedFilter, categoryFilter, search]);

  // function that fetches all the posts
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await getAllPostsAdmin({
        isDeleted: isDeletedFilter,
        category: categoryFilter || undefined,
        search: search || undefined,
      });
      setPosts(res.data.posts);
    } catch (err) {
      setError("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  // post delete handler function
  /*const handleSoftDelete = async (postId) => {
    try {
      await softDeletePost(postId, { reason: "violation" });
      setToastMessage("Post deleted successfully");
      setToastType("success");
      setShowToast(true);
      fetchPosts(); // refresh the posts after deleting
    } catch (err) {
      setToastMessage(err.response?.data?.message || "Failed to delete post");
      setToastType("error");
      setShowToast(true);
    }
  };*/

  // post restore handler function
  /*const handleRestore = async (postId) => {
    try {
      await restorePost(postId);
      setToastMessage("Post restored successfully");
      setToastType("success");
      setShowToast(true);
      fetchPosts(); //refresh the posts after restoring
    } catch (err) {
      setToastMessage(err.response?.data?.message || "Failed to restore post");
      setToastType("error");
      setShowToast(true);
    }
  };*/

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-6xl mx-auto px-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Posts</h1>
            <p className="text-gray-600 mt-1">View, delete or restore posts</p>
          </div>
          <Link
            to="/admin"
            className="flex items-center gap-2 text-indigo-600 hover:underline text-sm"
          >
            <FaArrowLeft /> Back to Dashboard
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow p-4 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by title or content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none bg-white"
          >
            <option value="">All Categories</option>
            <option value="Technology">Technology</option>
            <option value="Nature">Nature</option>
            <option value="Travel">Travel</option>
            <option value="Lifestyle">Lifestyle</option>
            <option value="Programming">Programming</option>
            <option value="Personal">Personal</option>
          </select>
          <select
            value={isDeletedFilter}
            onChange={(e) => setIsDeletedFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400 outline-none bg-white"
          >
            <option value="false">Active Posts</option>
            <option value="true">Deleted Posts</option>
          </select>
        </div>

        {/* Posts */}
        {loading ? (
          <p className="text-center mt-10">Loading posts...</p>
        ) : error ? (
          <p className="text-center mt-10 text-red-600">{error}</p>
        ) : posts.length === 0 ? (
          <p className="text-center mt-10 text-gray-500">No posts found</p>
        ) : (
          <div className="grid gap-4">
            {posts.map((post) => (
              <div
                key={post._id}
                onClick={() => navigate(`/admin/posts/${post._id}`)}
                className="bg-white rounded-xl shadow p-5 flex gap-4 items-start cursor-pointer hover:shadow-md transition"
              >
                {/* Post Image */}
                <img
                  src={
                    post.images?.[0] ||
                    post.media?.find((m) => m.type === "image")?.url
                  }
                  alt={post.title}
                  className="w-24 h-24 object-cover rounded-lg shrink-0"
                />

                {/* Post Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {post.title}
                    </h3>
                    {post.isDeleted && (
                      <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-medium">
                        Deleted
                      </span>
                    )}
                    {post.category && (
                      <span className="bg-indigo-50 text-indigo-600 text-xs px-2 py-0.5 rounded-full font-medium">
                        {post.category}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mb-2">{post.excerpt}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>By {post.author?.fullName}</span>
                    <span>
                      Created: {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    {post.deletedAt && (
                      <span>
                        Deleted: {new Date(post.deletedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
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

export default AdminPosts;
