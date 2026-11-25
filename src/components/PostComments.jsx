import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import {
  getComments,
  createComment,
  editComment,
  deleteComment,
} from "../api/postApi";
import { useAuth } from "../context/AuthContext";
import ConfirmModal from "./ConfirmModal";
import Skeleton from "./Skeleton";

const PAGE_SIZE = 10;
const COMMENT_MAX = 1000;

const formatDateTime = (value) =>
  new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });

const getErrorMessage = (err, fallback) => {
  const data = err.response?.data;
  return data?.errors?.[0]?.message || data?.message || fallback;
};

const CommentItem = ({
  comment,
  canLink,
  onUpdated,
  onRemoved,
  onDeleteRequest,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { author } = comment;
  const profileUrl =
    canLink && author.username ? `/profile/${author.username}` : null;

  const startEdit = () => {
    setDraft(comment.content);
    setError("");
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setError("");
  };

  const saveEdit = async () => {
    const trimmed = draft.trim();

    if (!trimmed) {
      setError("Comment cannot be empty");
      return;
    }
    if (trimmed === comment.content) {
      setEditing(false); // nothing changed, nothing to send
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await editComment(comment._id, trimmed);
      onUpdated(res.data.comment);
      setEditing(false);
    } catch (err) {
      // Comment (or its post) is gone: drop it from the list
      if (err.response?.status === 404) {
        onRemoved(comment._id);
        return;
      }
      setError(getErrorMessage(err, "Could not save your changes"));
    } finally {
      setSaving(false);
    }
  };

  const avatar = (
    <img
      src={author.image}
      alt={author.fullName}
      className="w-10 h-10 rounded-full object-cover"
    />
  );

  return (
    <li className="flex gap-3 py-5">
      <div className="shrink-0">
        {profileUrl ? <Link to={profileUrl}>{avatar}</Link> : avatar}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          {profileUrl ? (
            <Link
              to={profileUrl}
              className="font-semibold text-gray-900 hover:text-indigo-600 transition"
            >
              {author.fullName}
            </Link>
          ) : (
            <span className="font-semibold text-gray-900">
              {author.fullName}
            </span>
          )}
          {author.username && (
            <span className="text-sm text-indigo-600">@{author.username}</span>
          )}
          <span className="text-xs text-gray-500">
            · {formatDateTime(comment.createdAt)}
          </span>
          {comment.editedAt && (
            <span
              className="text-xs text-gray-400"
              title={`Edited ${formatDateTime(comment.editedAt)}`}
            >
              (edited)
            </span>
          )}
        </div>

        {editing ? (
          <div className="mt-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              maxLength={COMMENT_MAX}
              autoFocus
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
            />
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-red-600 min-h-4" aria-live="polite">
                {error}
              </p>
              <span className="text-xs text-gray-400">
                {draft.length}/{COMMENT_MAX}
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={saveEdit}
                disabled={saving}
                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={saving}
                className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 disabled:opacity-60 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-1 text-gray-700 whitespace-pre-wrap wrap-break-words">
              {comment.content}
            </p>

            {comment.isMine && (
              <div className="mt-2 flex gap-4 text-sm">
                <button
                  type="button"
                  onClick={startEdit}
                  className="inline-flex items-center gap-1.5 text-gray-500 hover:text-indigo-600 transition"
                >
                  <FiEdit2 /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteRequest(comment)}
                  className="inline-flex items-center gap-1.5 text-gray-500 hover:text-red-600 transition"
                >
                  <FiTrash2 /> Delete
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </li>
  );
};

const PostComments = ({ postId }) => {
  const { token, user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [comments, setComments] = useState([]);
  const [total, setTotal] = useState(0);
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [loadMoreError, setLoadMoreError] = useState("");

  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");

  const [toDelete, setToDelete] = useState(null);
  const [actionError, setActionError] = useState("");

  // First page (refetched if the viewer logs in/out so `isMine` stays correct)
  useEffect(() => {
    let cancelled = false;

    getComments(postId, { limit: PAGE_SIZE })
      .then((res) => {
        if (cancelled) return;
        setComments(res.data.comments);
        setTotal(res.data.total ?? res.data.comments.length);
        setCursor(res.data.nextCursor);
        setHasMore(res.data.hasMore);
        setLoadError("");
      })
      .catch(() => {
        if (!cancelled) setLoadError("Could not load comments");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [postId, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const content = draft.trim();
    if (!content) {
      setPostError("Write something before posting");
      return;
    }

    setPosting(true);
    setPostError("");

    try {
      const res = await createComment(postId, content);
      const created = res.data.comment;

      // Newest first: the new comment goes to the top
      setComments((prev) =>
        prev.some((c) => c._id === created._id) ? prev : [created, ...prev],
      );
      setTotal((t) => t + 1);
      setDraft("");
    } catch (err) {
      setPostError(getErrorMessage(err, "Could not post your comment"));
    } finally {
      setPosting(false);
    }
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    setLoadMoreError("");

    try {
      const res = await getComments(postId, { limit: PAGE_SIZE, cursor });

      setComments((prev) => {
        const seen = new Set(prev.map((c) => c._id));
        return [...prev, ...res.data.comments.filter((c) => !seen.has(c._id))];
      });
      setCursor(res.data.nextCursor);
      setHasMore(res.data.hasMore);
    } catch {
      setLoadMoreError("Could not load more comments. Please try again.");
    } finally {
      setLoadingMore(false);
    }
  };

  const handleUpdated = (updated) =>
    setComments((prev) =>
      prev.map((c) => (c._id === updated._id ? updated : c)),
    );

  const removeLocally = (id) => {
    setComments((prev) => prev.filter((c) => c._id !== id));
    setTotal((t) => Math.max(t - 1, 0));
  };

  const handleConfirmDelete = async () => {
    const target = toDelete;
    setToDelete(null); // closing first prevents a double-click delete
    if (!target) return;

    setActionError("");

    try {
      await deleteComment(target._id);
      removeLocally(target._id);
    } catch (err) {
      if (err.response?.status === 404) {
        removeLocally(target._id); // already gone
        return;
      }
      setActionError(getErrorMessage(err, "Could not delete the comment"));
    }
  };

  return (
    <section className="mt-10 pt-8 border-t" aria-labelledby="comments-heading">
      <h2 id="comments-heading" className="text-2xl font-bold text-gray-900">
        Comments{!loading && !loadError ? ` (${total})` : ""}
      </h2>

      {/* Composer */}
      <div className="mt-5">
        {isAdmin ? (
          <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-3">
            Admin accounts can't comment.
          </p>
        ) : token ? (
          <form onSubmit={handleSubmit}>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  handleSubmit(e);
                }
              }}
              rows={3}
              maxLength={COMMENT_MAX}
              placeholder="Share your thoughts..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-red-600" aria-live="polite">
                {postError}
              </p>
              <div className="flex items-center gap-4">
                <span className="text-xs text-gray-400">
                  {draft.length}/{COMMENT_MAX}
                </span>
                <button
                  type="submit"
                  disabled={posting || !draft.trim()}
                  className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {posting ? "Posting..." : "Post comment"}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <p className="text-gray-600 bg-gray-50 rounded-lg px-4 py-3">
            <Link to="/login" className="text-indigo-600 hover:underline">
              Log in
            </Link>{" "}
            to join the conversation.
          </p>
        )}
      </div>

      {actionError && (
        <p className="mt-4 text-sm text-red-600" aria-live="polite">
          {actionError}
        </p>
      )}

      {/* List */}
      {loading ? (
        <div className="mt-6 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : loadError ? (
        <p className="mt-6 text-center text-red-600">{loadError}</p>
      ) : comments.length === 0 ? (
        <p className="mt-6 text-center text-gray-500">
          No comments yet.
          {token && !isAdmin ? " Be the first to share your thoughts." : ""}
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-gray-100">
          {comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              canLink={!isAdmin}
              onUpdated={handleUpdated}
              onRemoved={removeLocally}
              onDeleteRequest={setToDelete}
            />
          ))}
        </ul>
      )}

      {loadMoreError && (
        <p className="text-center text-sm text-red-600 mt-4">{loadMoreError}</p>
      )}

      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-8 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {loadingMore ? "Loading..." : "Load more comments"}
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete comment"
        message="Are you sure you want to delete this comment? This can't be undone."
        confirmLabel="Delete"
        confirmColor="bg-red-600 hover:bg-red-700"
        iconBg="bg-red-100"
        iconColor="text-red-600"
      />
    </section>
  );
};

export default PostComments;
