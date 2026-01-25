import { useNavigate } from "react-router-dom";
import { LuPlus, LuPencilLine, LuBookOpen, LuFileText } from "react-icons/lu";

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <h3 className="mb-4 text-xl font-semibold">Quick Actions</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        <button
          onClick={() => navigate("/create-post")}
          className="flex items-center justify-between rounded-xl bg-indigo-600 px-5 py-4 text-white shadow hover:bg-indigo-700 transition"
        >
          <span className="text-lg"><LuPlus /> Create New Post</span>
          <span className="text-2xl"><LuPencilLine /></span>
        </button>

        <button
          onClick={() => navigate("/my-posts")}
          className="flex items-center justify-between rounded-xl bg-gray-100 px-5 py-4 text-gray-800 shadow hover:bg-gray-200 transition"
        >
          <span className="text-lg"><LuBookOpen /> View My Posts</span>
          <span className="text-2xl"><LuFileText /></span>
        </button>

      </div>
    </div>
  );
};

export default QuickActions;
