import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMyPosts, deletePost } from "../api/postApi";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import DeleteModal from "../components/DeleteModal";
import Toast from "../components/Toast";

import { AiOutlinePlusCircle } from "react-icons/ai";
import { FaPlus } from "react-icons/fa";

const MyPosts = () => {
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, published, draft

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  // Toast state
  const [showToast, setShowToast] = useState(false);

  // Fetch user's posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await getMyPosts();
        setPosts(res.data.posts);
        setFilteredPosts(res.data.posts);
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Filter posts based on selected filter
  useEffect(() => {
    if (filter === "all") {
      setFilteredPosts(posts);
    } else if (filter === "published") {
      setFilteredPosts(posts.filter((post) => post.published));
    } else if (filter === "draft") {
      setFilteredPosts(posts.filter((post) => !post.published));
    }
  }, [filter, posts]);

  // Handle delete confirmation
  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setShowDeleteModal(true);
  };

  // Actual logic to delete the post
  const handleDeleteConfirm = async () => {
    try {
      // Deleting the post
      await deletePost(postToDelete._id);

      // Keep every post except the one I deleted
      setPosts(posts.filter((p) => p._id !== postToDelete._id));

      setShowDeleteModal(false);
      setPostToDelete(null);
      setShowToast(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete post");
      setShowDeleteModal(false);
    }
  };

  // Handle post click
  const handlePostClick = (post) => {
    if (post.published) {
      navigate(`/posts/${post._id}`);
    } else {
      // if post is in draft then go to the 'Edit Post' page
      navigate(`/edit-post/${post._id}`);
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading your posts...</p>;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-10">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Posts</h1>
            <p className="text-gray-600 mt-1">
              Manage all your posts in one place
            </p>
          </div>

          <button
            onClick={() => navigate("/create-post")}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium 
             hover:bg-indigo-700 transition-all duration-200 hover:scale-[1.02]"
          >
            {/* <AiOutlinePlusCircle className="text-xl" /> */}
            <FaPlus className="text-xl" />
            <span>Create New Post</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              filter === "all"
                ? "bg-indigo-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            All ({posts.length})
          </button>
          <button
            onClick={() => setFilter("published")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              filter === "published"
                ? "bg-green-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Published ({posts.filter((p) => p.published).length})
          </button>
          <button
            onClick={() => setFilter("draft")}
            className={`px-6 py-2 rounded-lg font-medium transition ${
              filter === "draft"
                ? "bg-amber-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Drafts ({posts.filter((p) => !p.published).length})
          </button>
        </div>

        {/* Posts List */}
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center">
            <p className="text-gray-500 text-lg">
              {filter === "all"
                ? "You haven't created any posts yet."
                : filter === "published"
                  ? "No published posts yet."
                  : "No drafts yet."}
            </p>
            <button
              onClick={() => navigate("/create-post")}
              className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              Create Your First Post
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => (
              <div
                key={post._id}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition group"
              >
                {/* Post Image */}
                <div
                  onClick={() => handlePostClick(post)}
                  className="cursor-pointer relative"
                >
                  <img
                    src={
                      post.media?.find((m) => m.type === "image")?.url ||
                      "https://via.placeholder.com/400x250?text=No+Image"
                    }
                    alt={post.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition duration-300"
                  />

                  {/* Draft Badge */}
                  {!post.published && (
                    <span className="absolute top-3 right-3 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Draft
                    </span>
                  )}

                  {/* Published Badge */}
                  {post.published && (
                    <span className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      Published
                    </span>
                  )}
                </div>

                {/* Post Content */}
                <div className="p-5">
                  {/* Category */}
                  {post.category && (
                    <span className="inline-block bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                      {post.category}
                    </span>
                  )}

                  {/* Title */}
                  <h3
                    onClick={() => handlePostClick(post)}
                    className="text-xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-indigo-600 transition line-clamp-2"
                  >
                    {post.title}
                  </h3>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <span>
                      Created: {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                    {post.publishedAt && (
                      <span>
                        Published:{" "}
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/edit-post/${post._id}`)}
                      className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 transition"
                    >
                      <FiEdit /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(post)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition"
                    >
                      <FiTrash2 /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        postTitle={postToDelete?.title}
      />

      {/* Success Toast */}
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

export default MyPosts;
