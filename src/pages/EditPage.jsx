import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPostById, updatePost } from "../api/postApi";
import Toast from "../components/Toast";

const EditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    image: "",
    category: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState(""); // Dynamic toast message

  // Fetch existing post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await getPostById(id);
        const post = res.data;

        // Pre-fill form with existing data (no published field)
        setFormData({
          title: post.title || "",
          content: post.content || "",
          excerpt: post.excerpt || "",
          image: post.image || "",
          category: post.category || "",
        });
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle Save as Draft
  const handleSaveAsDraft = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await updatePost(id, { ...formData, published: false });
      setToastMessage("Post saved as draft successfully!");
      setShowToast(true);

      setTimeout(() => {
        navigate("/my-posts");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save draft");
      setSubmitting(false);
    }
  };

  // Handle Publish Post
  const handlePublish = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await updatePost(id, { ...formData, published: true });
      setToastMessage("Post published successfully!");
      setShowToast(true);

      setTimeout(() => {
        navigate(`/posts/${id}`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to publish post");
      setSubmitting(false);
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Loading post...</p>;
  }

  if (error && !formData.title) {
    return <p className="text-center mt-10 text-red-600">{error}</p>;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Post</h1>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter post title"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              required
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Excerpt (Short Summary)
            </label>
            <input
              type="text"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="Brief summary of your post"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your post content here..."
              rows="10"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
              required
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Category */}
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg 
               focus:ring-2 focus:ring-indigo-500 focus:border-transparent 
               outline-none transition bg-white"
            >
              <option value="">Select a category</option>
              <option value="Technology">Technology</option>
              <option value="Nature">Nature</option>
              <option value="Travel">Travel</option>
              <option value="Lifestyle">Lifestyle</option>
              <option value="Programming">Programming</option>
              <option value="Personal">Personal</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            {/* Save as Draft */}
            <button
              type="button"
              onClick={handleSaveAsDraft}
              disabled={submitting}
              className="flex-1 bg-amber-500 text-white py-3 rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting ? "Saving..." : "Save as Draft"}
            </button>

            {/* Publish */}
            <button
              type="button"
              onClick={handlePublish}
              disabled={submitting}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting ? "Publishing..." : "Publish Post"}
            </button>

            {/* Cancel */}
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Success Toast with dynamic message */}
      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
          type="success"
        />
      )}
    </div>
  );
};

export default EditPage;
