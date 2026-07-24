import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPostById, updatePost } from "../api/postApi";
import Toast from "../components/Toast";
import { FiUpload, FiX } from "react-icons/fi";

const MAX_IMAGES = 5;

const EditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
  });

  const [existingImages, setExistingImages] = useState([]); // URLs already on the post (kept ones)
  const [newImageFiles, setNewImageFiles] = useState([]); // newly added File objects
  const [newImagePreviews, setNewImagePreviews] = useState([]); // preview URLs for new files

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const totalImageCount = existingImages.length + newImageFiles.length;

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await getPostById(id);
        const post = res.data;

        setFormData({
          title: post.title || "",
          content: post.content || "",
          excerpt: post.excerpt || "",
          category: post.category || "",
        });

        setExistingImages(post.media || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (totalImageCount + files.length > MAX_IMAGES) {
      setError(`You can have a maximum of ${MAX_IMAGES} media items total`);
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    const validFiles = [];
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        setError(
          `"${file.name}" is not a supported image/video type and was skipped`,
        );
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setNewImageFiles((prev) => [...prev, ...validFiles]);
    setNewImagePreviews((prev) => [
      ...prev,
      ...validFiles.map((file) => ({
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video/") ? "video" : "image",
      })),
    ]);
    setError("");
    e.target.value = "";
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (published) => {
    setError("");
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("content", formData.content);
      formDataToSend.append("excerpt", formData.excerpt);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("published", published);

      // Tell backend which existing media to keep
      formDataToSend.append("existingMedia", JSON.stringify(existingImages));

      // Append newly added files
      newImageFiles.forEach((file) => {
        formDataToSend.append("media", file);
      });

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

          {/* Images */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Post Images
              </label>
              <span className="text-xs text-gray-500">
                {totalImageCount}/{MAX_IMAGES}
              </span>
            </div>

            {/* Existing + new previews together */}
            {(existingImages.length > 0 || newImagePreviews.length > 0) && (
              <div className="grid grid-cols-3 gap-3 mb-3">
                {existingImages.map((item, index) => (
                  <div key={`existing-${index}`} className="relative">
                    {item.type === "video" ? (
                      <video
                        src={item.url}
                        className="w-full h-28 object-cover rounded-lg"
                        muted
                      />
                    ) : (
                      <img
                        src={item.url}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-28 object-cover rounded-lg"
                      />
                    )}
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                        Cover
                      </span>
                    )}
                    {item.type === "video" && (
                      <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                        Video
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeExistingImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                    >
                      <FiX className="text-xs" />
                    </button>
                  </div>
                ))}

                {newImagePreviews.map((preview, index) => (
                  <div key={`new-${index}`} className="relative">
                    {preview.type === "video" ? (
                      <video
                        src={preview.url}
                        className="w-full h-28 object-cover rounded-lg"
                        muted
                      />
                    ) : (
                      <img
                        src={preview.url}
                        alt={`New ${index + 1}`}
                        className="w-full h-28 object-cover rounded-lg"
                      />
                    )}
                    <span className="absolute bottom-1 left-1 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                      New
                    </span>
                    {preview.type === "video" && (
                      <span className="absolute top-1 left-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                        Video
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                    >
                      <FiX className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {totalImageCount < MAX_IMAGES && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition">
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
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
                    Click to upload image(s) or video(s)
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    Images or videos — up to {MAX_IMAGES} items
                  </span>
                </label>
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
