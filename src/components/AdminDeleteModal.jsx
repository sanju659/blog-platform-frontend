import { useState } from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";

const REASONS = ["spam", "abuse", "illegal", "violation", "other"];

const AdminDeleteModal = ({ isOpen, onClose, onConfirm, postTitle }) => {
  const [reason, setReason] = useState("violation");

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-slideDown">
        {/* Header */}
        <div className="bg-red-50 p-6 flex items-center gap-4">
          <div className="bg-red-100 p-3 rounded-full">
            <FiAlertTriangle className="text-red-600 text-2xl" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900">Delete Post</h3>
            <p className="text-sm text-gray-600 mt-1">
              This will hide the post from all users
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete this post?
          </p>
          {postTitle && (
            <p className="font-semibold text-gray-900 bg-gray-50 p-3 rounded-lg">
              "{postTitle}"
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for deletion
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-red-400 outline-none bg-white"
            >
              {REASONS.map((r) => (
                <option key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDeleteModal;