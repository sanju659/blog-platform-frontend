import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AiFillLike,
  AiOutlineLike,
  AiFillDislike,
  AiOutlineDislike,
} from "react-icons/ai";
import { getReactions, setReaction, removeReaction } from "../api/postApi";
import { useAuth } from "../context/AuthContext";
import Skeleton from "./Skeleton";

// Local preview of what the counts will be after a reaction change
const applyReaction = (data, next) => {
  let { likeCount, dislikeCount } = data;

  if (data.currentUserReaction === "like") likeCount -= 1;
  if (data.currentUserReaction === "dislike") dislikeCount -= 1;
  if (next === "like") likeCount += 1;
  if (next === "dislike") dislikeCount += 1;

  return { likeCount, dislikeCount, currentUserReaction: next };
};

const ReactionButton = ({
  label,
  count,
  active,
  Icon,
  ActiveIcon,
  activeClass,
  onClick,
  disabled,
  title,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-pressed={active}
    aria-label={`${label} (${count})`}
    title={title}
    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed ${
      active ? activeClass : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`}
  >
    {active ? <ActiveIcon className="text-xl" /> : <Icon className="text-xl" />}
    <span>{count}</span>
  </button>
);

const PostReactions = ({ postId }) => {
  const { token, user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [data, setData] = useState(null); // { likeCount, dislikeCount, currentUserReaction }
  const [loadError, setLoadError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getReactions(postId)
      .then((res) => {
        if (cancelled) return;
        setData(res.data);
        setLoadError(false);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [postId, token]);

  const handleClick = async (type) => {
    if (!token) {
      setShowLoginPrompt(true);
      return;
    }
    if (isAdmin || busy || !data) return;

    setMessage("");

    const previous = data;
    // Clicking your current reaction again removes it
    const next = previous.currentUserReaction === type ? null : type;

    setData(applyReaction(previous, next)); // optimistic
    setBusy(true);

    try {
      const res = next
        ? await setReaction(postId, next)
        : await removeReaction(postId);
      setData(res.data); // replace the guess with the server's numbers
    } catch (err) {
      setData(previous); // roll back
      setMessage(err.response?.data?.message || "Could not save your reaction");
    } finally {
      setBusy(false);
    }
  };

  if (loadError) {
    return (
      <p className="mt-8 pt-6 border-t text-sm text-gray-400">
        Reactions are unavailable right now.
      </p>
    );
  }

  if (!data) {
    return (
      <div className="mt-8 pt-6 border-t flex gap-3">
        <Skeleton className="h-11 w-24 rounded-full" />
        <Skeleton className="h-11 w-24 rounded-full" />
      </div>
    );
  }

  const adminTitle = isAdmin
    ? "Admin accounts can't react to posts"
    : undefined;

  return (
    <div className="mt-8 pt-6 border-t">
      <div className="flex items-center gap-3">
        <ReactionButton
          label="Like"
          count={data.likeCount}
          active={data.currentUserReaction === "like"}
          Icon={AiOutlineLike}
          ActiveIcon={AiFillLike}
          activeClass="bg-indigo-600 text-white"
          onClick={() => handleClick("like")}
          disabled={busy || isAdmin}
          title={adminTitle}
        />
        <ReactionButton
          label="Dislike"
          count={data.dislikeCount}
          active={data.currentUserReaction === "dislike"}
          Icon={AiOutlineDislike}
          ActiveIcon={AiFillDislike}
          activeClass="bg-red-500 text-white"
          onClick={() => handleClick("dislike")}
          disabled={busy || isAdmin}
          title={adminTitle}
        />
      </div>

      <div aria-live="polite" className="mt-3 text-sm min-h-5">
        {message ? (
          <p className="text-red-600">{message}</p>
        ) : showLoginPrompt && !token ? (
          <p className="text-gray-600">
            <Link to="/login" className="text-indigo-600 hover:underline">
              Log in
            </Link>{" "}
            to react to this post.
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default PostReactions;
