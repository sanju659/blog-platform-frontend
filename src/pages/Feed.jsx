import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFeed } from "../api/postApi";
import Skeleton from "../components/Skeleton";

const PAGE_SIZE = 10;

const FeedCard = ({ post }) => {
  const cover = post.media?.find((m) => m.type === "image" && m.url)?.url;
  const hasVideo = post.media?.some((m) => m.type === "video");
  const date = new Date(
    post.publishedAt || post.createdAt,
  ).toLocaleDateString();

  const authorInfo = (
    <>
      <img
        src={post.author.image}
        alt={post.author.fullName}
        className="w-10 h-10 rounded-full object-cover"
      />
      <div className="leading-tight">
        <p className="font-medium text-gray-900 group-hover:text-indigo-600 transition">
          {post.author.fullName}
        </p>
        <p className="text-xs text-gray-500">
          {post.author.username ? `@${post.author.username} · ` : ""}
          {date}
        </p>
      </div>
    </>
  );

  return (
    <article className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Author */}
      <div className="p-5 pb-3">
        {post.author.username ? (
          <Link
            to={`/profile/${post.author.username}`}
            className="inline-flex items-center gap-3 group"
          >
            {authorInfo}
          </Link>
        ) : (
          <div className="inline-flex items-center gap-3 group">
            {authorInfo}
          </div>
        )}
      </div>

      {/* Cover */}
      <Link to={`/posts/${post._id}`} className="block">
        {cover ? (
          <img
            src={cover}
            alt={post.title}
            className="h-56 w-full object-cover object-top"
          />
        ) : (
          <div className="h-56 w-full bg-linear-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-300 text-sm">
            {hasVideo ? "Video post" : "No image"}
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-5">
        {post.category && (
          <span className="inline-block bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            {post.category}
          </span>
        )}
        <h2 className="text-xl font-bold text-gray-900">
          <Link
            to={`/posts/${post._id}`}
            className="hover:text-indigo-600 transition"
          >
            {post.title}
          </Link>
        </h2>
        {post.excerpt && (
          <p className="text-gray-600 text-sm mt-2 line-clamp-3">
            {post.excerpt}
          </p>
        )}
      </div>
    </article>
  );
};

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [loadMoreError, setLoadMoreError] = useState("");

  // First page
  useEffect(() => {
    let cancelled = false;

    getFeed({ limit: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setPosts(res.data.posts);
        setCursor(res.data.nextCursor);
        setHasMore(res.data.hasMore);
        setFollowingCount(res.data.followingCount);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load your feed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    setLoadMoreError("");

    try {
      const res = await getFeed({ limit: PAGE_SIZE, cursor });

      // De-duplicate as a safety net
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p._id));
        return [...prev, ...res.data.posts.filter((p) => !seen.has(p._id))];
      });
      setCursor(res.data.nextCursor);
      setHasMore(res.data.hasMore);
    } catch {
      setLoadMoreError("Could not load more posts. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-10">
      <div className="max-w-2xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Following</h1>
          <p className="text-gray-600 mt-1">
            Latest posts from people you follow
          </p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-md overflow-hidden"
              >
                <div className="p-5 flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-56 w-full rounded-none" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl shadow p-12 text-center">
            {followingCount === 0 ? (
              <>
                <p className="text-gray-700 text-lg font-medium">
                  Your feed is empty
                </p>
                <p className="text-gray-500 mt-1">
                  Follow people to see their posts here.
                </p>
                <Link
                  to="/"
                  className="inline-block mt-5 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
                >
                  Discover posts
                </Link>
              </>
            ) : (
              <>
                <p className="text-gray-700 text-lg font-medium">
                  Nothing new yet
                </p>
                <p className="text-gray-500 mt-1">
                  The people you follow haven't published any posts yet.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <FeedCard key={post._id} post={post} />
            ))}
          </div>
        )}

        {loadMoreError && (
          <p className="text-center text-sm text-red-600 mt-4">
            {loadMoreError}
          </p>
        )}

        {hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loadingMore ? "Loading..." : "Load more"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
