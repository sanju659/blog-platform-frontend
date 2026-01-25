import { useNavigate } from "react-router-dom";
import { LuArrowRight } from "react-icons/lu";

const RecentPosts = ({ posts }) => {
  const navigate = useNavigate();

  return (
    <div className="rounded-2xl bg-white p-6 shadow">
      <h3 className="mb-4 text-xl font-semibold">Recent Posts</h3>

      {posts.length === 0 && (
        <p className="text-gray-500">You haven’t created any posts yet.</p>
      )}

      <ul className="space-y-4">
        {posts.map(post => (
          <li
            key={post._id}
            onClick={() => navigate(`/posts/${post._id}`)}
            className="group cursor-pointer rounded-xl p-4 hover:bg-gray-50 transition flex justify-between items-center"
          >
            <div>
              <h4 className="font-medium text-gray-800 group-hover:text-indigo-600">
                {post.title}
              </h4>

              <p className="text-sm text-gray-500 mt-1">
                Created on {new Date(post.createdAt).toDateString()}
              </p>
            </div>

            <span className="text-gray-400 group-hover:text-indigo-500 text-xl">
              <LuArrowRight />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RecentPosts;
