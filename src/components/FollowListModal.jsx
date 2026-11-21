import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { getFollowers, getFollowing } from "../api/userApi";

const PAGE_SIZE = 20;

const fetchList = (type, username, params) =>
  type === "followers"
    ? getFollowers(username, params)
    : getFollowing(username, params);

const FollowListModal = ({ username, type, onClose }) => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [loadMoreError, setLoadMoreError] = useState("");

  const title = type === "followers" ? "Followers" : "Following";

  // First page
  useEffect(() => {
    let cancelled = false;

    fetchList(type, username, { page: 1, limit: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setUsers(res.data.users);
        setHasMore(res.data.hasMore);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load this list");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [type, username]);

  // Close on Escape
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    setLoadMoreError("");

    try {
      const nextPage = page + 1;
      const res = await fetchList(type, username, {
        page: nextPage,
        limit: PAGE_SIZE,
      });

      setUsers((prev) => {
        const seen = new Set(prev.map((u) => u._id));
        return [...prev, ...res.data.users.filter((u) => !seen.has(u._id))];
      });
      setPage(nextPage);
      setHasMore(res.data.hasMore);
    } catch {
      setLoadMoreError("Could not load more. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 flex items-center justify-between border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <FiX className="text-2xl" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          {loading ? (
            <p className="p-6 text-center text-gray-500">Loading...</p>
          ) : error ? (
            <p className="p-6 text-center text-red-600">{error}</p>
          ) : users.length === 0 ? (
            <p className="p-6 text-center text-gray-500">
              {type === "followers"
                ? "No followers yet."
                : "Not following anyone yet."}
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {users.map((u) => (
                <li key={u._id}>
                  <Link
                    to={`/profile/${u.username}`}
                    onClick={onClose}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition"
                  >
                    <img
                      src={u.image}
                      alt={u.fullName}
                      className="w-11 h-11 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {u.fullName}
                      </p>
                      <p className="text-sm text-indigo-600 truncate">
                        @{u.username}
                      </p>
                      {u.bio && (
                        <p className="text-xs text-gray-500 truncate">
                          {u.bio}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {loadMoreError && (
            <p className="text-center text-sm text-red-600 py-2">
              {loadMoreError}
            </p>
          )}

          {hasMore && (
            <div className="p-4 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {loadingMore ? "Loading..." : "Load more"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowListModal;
