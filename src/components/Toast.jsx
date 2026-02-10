import React, { useEffect } from "react";
import { FiCheckCircle, FiX, FiAlertCircle } from "react-icons/fi";

const Toast = ({ message, onClose, type = "success" }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Auto-close after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500";
  const Icon = type === "success" ? FiCheckCircle : FiAlertCircle;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slideInRight">
      <div
        className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-75`}
      >
        <Icon className="text-2xl shrink-0" />
        <p className="flex-1 font-medium">{message}</p>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition"
        >
          <FiX className="text-xl" />
        </button>
      </div>
    </div>
  );
};

export default Toast;