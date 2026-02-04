import React from "react";
import { FiAlertTriangle, FiX } from "react-icons/fi";

const DeleteModal = ({ isOpen, onClose, onConfirm, postTitle }) => {
  // if '!showDeleteModal' then return 'null'
  if (!isOpen) return null;

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
              This action cannot be undone
            </p>
          </div>
          {/* cross button (onclick close the delete modal) */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700 mb-2">
            Are you sure you want to delete this post?
          </p>
          {postTitle && (
            <p className="font-semibold text-gray-900 bg-gray-50 p-3 rounded-lg">
              "{postTitle}"
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex gap-3 justify-end">
          {/* cancel button (onclick close the delete modal) */}
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          {/* Delete confirm button */}
          <button
            onClick={onConfirm}
            className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;