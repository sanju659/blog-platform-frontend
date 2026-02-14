import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../api/postApi";
import Toast from "../components/Toast";
import { FiUpload, FiX } from "react-icons/fi";

const CreatePost = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

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
      // Here is the file object
      /*console.log(file);*/
      /*File {name: 'Psyduck.jpg', lastModified: 1767162359228, lastModifiedDate: Wed Dec 31 2025 11:55:59 GMT+0530 (India Standard Time), webkitRelativePath: '', size: 24626, …}
       lastModified : 1767162359228
       lastModifiedDate : Wed Dec 31 2025 11:55:59 GMT+0530 (India Standard Time) {}
       name : "Psyduck.jpg"
       size : 24626
       type : "image/jpeg"
       [[Prototype]] : File
      */

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

      // Image preview Url
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      // console.log(previewUrl); --> blob:http://localhost:5173/f0960946-a899-4be7-ab37-73dff2d132ed

      setError("");
    }
  };

  // Remove selected image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Handle form submission
  const handleSubmit = async (published) => {
    setError("");
    setSubmitting(true);

    try {
      // Create 'FormData object' for file upload as we can not send 'json' data
      //Create empty form container
      const formDataToSend = new FormData();
      // Add text fields
      formDataToSend.append("title", formData.title);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("excerpt", formData.excerpt);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("published", published);
      //Adding file
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      // So here we send the data to 'create post' api
      const res = await createPost(formDataToSend);

      setToastMessage(
        // IF published true then 'success' and if not then 'save as draft'
        published
          ? "Post published successfully!"
          : "Post saved as draft successfully!",
      );

      setShowToast(true);

      setTimeout(() => {
        if (published) {
          navigate(`/posts/${res.data.userpost._id}`);
        } else {
          navigate("/my-posts");
        }
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create post");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-10">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Create New Post
        </h1>

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

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Image
            </label>

            {!imagePreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <FiUpload className="text-4xl text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Click to upload an image
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF, WebP (Max 5MB)
                  </span>
                </label>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                >
                  <FiX />
                </button>
              </div>
            )}
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
            {/* Save as Draft */}
            <button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="flex-1 bg-amber-500 text-white py-3 rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting ? "Saving..." : "Save as Draft"}
            </button>

            {/* Publish */}
            <button
              type="button"
              onClick={() => handleSubmit(true)}
              disabled={submitting}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting ? "Publishing..." : "Publish Post"}
            </button>

            {/* Cancel */}
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Success Toast */}
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

export default CreatePost;
