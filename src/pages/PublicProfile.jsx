import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { FiMoreVertical, FiInfo, FiLink, FiX, FiEdit2 } from "react-icons/fi";
import {
  getPublicProfile,
  getUserPosts,
  followUser,
  unfollowUser,
} from "../api/userApi";
import Skeleton from "../components/Skeleton";
import Toast from "../components/Toast";
import { useAuth } from "../context/AuthContext";
import FollowListModal from "../components/FollowListModal";

const PAGE_SIZE = 9;

const formatLongDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const PostCard = ({ post }) => {
  const cover = post.media?.find((m) => m.type === "image" && m.url)?.url;

  return (
    <Link
      to={`/posts/${post._id}`}
      className="block bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition"
    >
      {cover ? (
        <img
          src={cover}
          alt={post.title}
          className="h-44 w-full object-cover object-top"
        />
      ) : (
        <div className="h-44 w-full bg-linear-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-300 text-sm">
          No image
        </div>
      )}

      <div className="p-5">
        {post.category && (
          <span className="inline-block bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            {post.category}
          </span>
        )}
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
            {post.excerpt}
          </p>
        )}
        <p className="text-xs text-gray-500 mt-3">
          {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
        </p>
      </div>
    </Link>
  );
};

const ProfileView = ({ username }) => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [loadMoreError, setLoadMoreError] = useState("");
  const [followBusy, setFollowBusy] = useState(false);
  const [listType, setListType] = useState(null); // "followers" | "following" | null

  const [menuOpen, setMenuOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }
  const menuRef = useRef(null);

  // Load profile + first page of posts
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [profileRes, postsRes] = await Promise.all([
          getPublicProfile(username),
          getUserPosts(username, { page: 1, limit: PAGE_SIZE }),
        ]);
        if (cancelled) return;
        setProfile(profileRes.data);
        setPosts(postsRes.data.posts);
        setHasMore(postsRes.data.hasMore);
      } catch (err) {
        if (cancelled) return;
        if (err.response?.status === 404) setNotFound(true);
        else setError("Failed to load profile");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [username]);

  // Close the three-dot menu on outside click / Escape
  useEffect(() => {
    if (!menuOpen) return;

    const onMouseDown = (e) => {
      if (!menuRef.current?.contains(e.target)) setMenuOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  // Close the About modal on Escape
  useEffect(() => {
    if (!showAbout) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") setShowAbout(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [showAbout]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    setLoadMoreError("");

    try {
      const nextPage = page + 1;
      const res = await getUserPosts(username, {
        page: nextPage,
        limit: PAGE_SIZE,
      });

      // De-duplicate in case new posts shifted the pages
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p._id));
        return [...prev, ...res.data.posts.filter((p) => !seen.has(p._id))];
      });
      setPage(nextPage);
      setHasMore(res.data.hasMore);
    } catch {
      setLoadMoreError("Could not load more posts. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCopyLink = async () => {
    setMenuOpen(false);
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/profile/${profile.username}`,
      );
      setToast({ message: "Profile link copied", type: "success" });
    } catch {
      setToast({ message: "Could not copy the link", type: "error" });
    }
  };

  const handleFollowToggle = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    setFollowBusy(true);
    try {
      const res = profile.isFollowing
        ? await unfollowUser(profile.username)
        : await followUser(profile.username);

      setProfile((prev) => ({
        ...prev,
        isFollowing: res.data.isFollowing,
        followersCount: res.data.followersCount,
        followingCount: res.data.followingCount,
      }));
    } catch (err) {
      setToast({
        message: err.response?.data?.message || "Something went wrong",
        type: "error",
      });
    } finally {
      setFollowBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-10">
        <div className="max-w-5xl mx-auto px-6 space-y-8">
          <div className="bg-white rounded-2xl shadow p-8 flex gap-5">
            <Skeleton className="w-24 h-24 rounded-full shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <h1 className="text-3xl font-bold text-gray-900">Profile not found</h1>
        <p className="text-gray-600">
          There is no user with the username @{username}.
        </p>
        <Link to="/" className="text-indigo-600 hover:underline">
          Back to home
        </Link>
      </div>
    );
  }

  if (error) {
    return <p className="text-center mt-10 text-red-600">{error}</p>;
  }

  // Fallback: the API says this is the viewer's own profile
  if (profile?.isOwner) {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-10">
      <div className="max-w-5xl mx-auto px-6 space-y-8">
        {/* Header card */}
        <div className="bg-white rounded-2xl shadow p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            {/* Profile identity and information */}
            <div className="flex items-start gap-4 sm:gap-5 flex-1 min-w-0">
              <img
                src={profile.image}
                alt={profile.fullName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-4 ring-indigo-100 shrink-0"
              />

              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 wrap-break-words">
                  {profile.fullName}
                </h1>

                <p className="text-indigo-600 text-sm sm:text-base break-all">
                  @{profile.username}
                </p>

                <p className="mt-3 text-sm sm:text-base text-gray-700 whitespace-pre-wrap wrap-break-word">
                  {profile.bio || (
                    <span className="text-gray-400">No bio yet.</span>
                  )}
                </p>

                <p className="mt-3 text-xs sm:text-sm text-gray-500">
                  Joined {formatLongDate(profile.createdAt)} ·{" "}
                  {profile.postCount}{" "}
                  {profile.postCount === 1 ? "post" : "posts"}
                </p>

                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <button
                    onClick={() => setListType("followers")}
                    className="hover:underline"
                  >
                    <span className="font-bold text-gray-900">
                      {profile.followersCount}
                    </span>{" "}
                    <span className="text-gray-500">
                      {profile.followersCount === 1 ? "follower" : "followers"}
                    </span>
                  </button>

                  <button
                    onClick={() => setListType("following")}
                    className="hover:underline"
                  >
                    <span className="font-bold text-gray-900">
                      {profile.followingCount}
                    </span>{" "}
                    <span className="text-gray-500">following</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Profile actions */}
            <div className="flex items-center justify-end gap-2 sm:shrink-0">
              {!profile.isOwner && (
                <button
                  onClick={handleFollowToggle}
                  disabled={followBusy}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed ${
                    profile.isFollowing
                      ? "bg-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
                  }`}
                >
                  {followBusy
                    ? "..."
                    : profile.isFollowing
                      ? "Following"
                      : "Follow"}
                </button>
              )}

              {/* Three-dot menu */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  aria-label="More options"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen((open) => !open)}
                  className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition"
                >
                  <FiMoreVertical className="text-xl" />
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20"
                  >
                    <button
                      role="menuitem"
                      onClick={() => {
                        setMenuOpen(false);
                        setShowAbout(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <FiInfo /> About this profile
                    </button>

                    <button
                      role="menuitem"
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <FiLink /> Copy profile link
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Posts */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Posts ({profile.postCount})
          </h2>

          {posts.length === 0 ? (
            <div className="bg-white rounded-2xl shadow p-12 text-center text-gray-500">
              No published posts yet.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
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

      {/* About this profile modal */}
      {showAbout && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowAbout(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-title"
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex items-center gap-4 border-b border-gray-100">
              <img
                src={profile.image}
                alt={profile.fullName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <h3
                  id="about-title"
                  className="text-lg font-bold text-gray-900"
                >
                  About this profile
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  @{profile.username}
                </p>
              </div>
              <button
                onClick={() => setShowAbout(false)}
                aria-label="Close"
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <FiX className="text-2xl" />
              </button>
            </div>

            <dl className="p-6 space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Display name</dt>
                <dd className="font-medium text-gray-900 text-right">
                  {profile.fullName}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Username</dt>
                <dd className="font-medium text-gray-900 text-right">
                  @{profile.username}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Joined</dt>
                <dd className="font-medium text-gray-900 text-right">
                  {formatLongDate(profile.createdAt)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Published posts</dt>
                <dd className="font-medium text-gray-900 text-right">
                  {profile.postCount}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {listType && (
        <FollowListModal
          key={listType}
          username={profile.username}
          type={listType}
          onClose={() => setListType(null)}
        />
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

const PublicProfile = () => {
  const { username } = useParams();
  const { user, loading } = useAuth();

  if (loading) return null;

  // Admins don't browse profiles: send them to their dashboard
  if (user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  // Your own public profile isn't shown to you: use My Profile instead
  if (user?.username && user.username === username.toLowerCase()) {
    return <Navigate to="/profile" replace />;
  }

  // key remounts the view, so state resets when moving between profiles
  return <ProfileView key={username} username={username} />;
};

export default PublicProfile;
