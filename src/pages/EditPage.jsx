import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPostById, updatePost } from "../api/postApi";
import Toast from "../components/Toast";
import { FiUpload, FiX } from "react-icons/fi";

const EditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
  });

  const [existingImage, setExistingImage] = useState(null); // Store existing image URL
  const [imageFile, setImageFile] = useState(null); // New image file
  const [imagePreview, setImagePreview] = useState(null); // Preview for new image
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Fetch existing post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await getPostById(id);
        const post = res.data;

        // Pre-fill form with existing data
        setFormData({
          title: post.title || "",
          content: post.content || "",
          excerpt: post.excerpt || "",
          category: post.category || "",
        });

        // Store existing image
        setExistingImage(post.image || null);
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

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError("Only image files (JPEG, PNG, GIF, WebP) are allowed");
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError("");
    }
  };

  // Remove new selected image (revert to existing)
  const removeNewImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Remove existing image completely
  const removeExistingImage = () => {
    setExistingImage(null);
  };

  // Handle form submission
  const handleSubmit = async (published) => {
    setError("");
    setSubmitting(true);

    try {
      // Create FormData object
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("excerpt", formData.excerpt);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("published", published);

      // Add new image if selected
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      await updatePost(id, formDataToSend);
      setToastMessage(
        published
          ? "Post published successfully!"
          : "Post saved as draft successfully!",
      );
      setShowToast(true);

      setTimeout(() => {
        if (published) {
          navigate(`/posts/${id}`);
        } else {
          navigate("/my-posts");
        }
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update post");
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

          {/* Image Upload/Update */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Image
            </label>

            {/* Preview if image exists */}
            {imagePreview || existingImage ? (
              <div className="relative">
                <img
                  src={imagePreview || existingImage}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => {
                    if (imagePreview) removeNewImage();
                    else removeExistingImage();
                  }}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                >
                  <FiX />
                </button>

                {/* Status badge */}
                <span
                  className={`absolute bottom-2 left-2 px-3 py-1 rounded-full text-xs font-semibold text-white
          ${imagePreview ? "bg-green-500" : "bg-blue-500"}`}
                >
                  {imagePreview ? "New Image" : "Current Image"}
                </span>
              </div>
            ) : (
              /* Empty state */
              <label
                htmlFor="image-upload"
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center
             hover:border-indigo-500 transition cursor-pointer block"
              >
                <FiUpload className="text-4xl text-gray-400 mb-2 mx-auto" />
                <p className="text-sm text-gray-600">
                  Click to upload an image
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF, WebP (Max 5MB)
                </p>
              </label>
            )}

            {/* Upload / Change button (always visible) */}
            <div className="mt-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100 transition"
              >
                <FiUpload />
                {imagePreview || existingImage
                  ? "Change Image"
                  : "Upload Image"}
              </label>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition bg-white"
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
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="flex-1 bg-amber-500 text-white py-3 rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting ? "Saving..." : "Save as Draft"}
            </button>

            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting ? "Publishing..." : "Publish Post"}
            </button>

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
