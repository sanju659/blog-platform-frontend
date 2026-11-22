import { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateProfile, changePassword, checkUsername } from "../api/authAPi";
import Toast from "../components/Toast";
import { FiUpload, FiX, FiEdit2, FiLink } from "react-icons/fi";
import see from "./../assets/see.ico";
import unsee from "./../assets/unsee.ico";
import { getPublicProfile } from "../api/userApi";
import FollowListModal from "../components/FollowListModal";

const BIO_MAX = 200;

const Profile = () => {
  const { user, login, token } = useAuth();

  // Edit mode states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Profile form state (filled from `user` when editing starts)
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [profileSubmitting, setProfileSubmitting] = useState(false);
  const [profileError, setProfileError] = useState("");

  // Username availability
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameCheck, setUsernameCheck] = useState(null); // { username, available, reason }

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const [counts, setCounts] = useState(null); // { followersCount, followingCount }
  const [listType, setListType] = useState(null); // "followers" | "following" | null

  // Username rules
  const usernameLocked = !!user?.usernameLockedUntil;
  const usernameChanged =
    isEditingProfile && !usernameLocked && username !== (user?.username || "");

  // Instant client-side format check (mirrors the backend rules)
  const usernameFormatError = !usernameChanged
    ? ""
    : username.length < 3
      ? "At least 3 characters"
      : !/^[a-z]/.test(username)
        ? "Must start with a letter"
        : !/^[a-z0-9_]+$/.test(username)
          ? "Only lowercase letters, numbers and underscores"
          : "";

  // Only trust a server result that belongs to the current input
  const usernameResult =
    usernameChanged && usernameCheck?.username === username
      ? usernameCheck
      : null;

  // Debounced availability check (only when the username actually changed)
  useEffect(() => {
    if (!usernameChanged || usernameFormatError) return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      setCheckingUsername(true);
      try {
        const res = await checkUsername(username);
        if (!cancelled) setUsernameCheck({ username, ...res.data });
      } catch {
        if (!cancelled) setUsernameCheck(null);
      } finally {
        if (!cancelled) setCheckingUsername(false);
      }
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [username, usernameChanged, usernameFormatError]);

  // Follower / following counts (from the existing public profile API)
  useEffect(() => {
    if (!user?.username) return;

    let cancelled = false;
    getPublicProfile(user.username)
      .then((res) => {
        if (cancelled) return;
        setCounts({
          followersCount: res.data.followersCount,
          followingCount: res.data.followingCount,
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [user?.username]);

  // Start editing: copy the current values into the form
  const startEditingProfile = () => {
    setFullName(user?.fullName || "");
    setUsername(user?.username || "");
    setEmail(user?.email || "");
    setBio(user?.bio || "");
    setProfileError("");
    setIsEditingProfile(true);
  };

  // Cancel profile edit handler
  const handleCancelProfile = () => {
    setImageFile(null);
    setImagePreview(null);
    setProfileError("");
    setIsEditingProfile(false);
  };

  // Cancel password edit handler
  const handleCancelPassword = () => {
    setCurrentPassword("");
    setNewPassword("");
    setPasswordError("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setIsEditingPassword(false);
  };

  const handleCopyProfileLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/profile/${user.username}`,
      );
      setToastMessage("Profile link copied");
      setToastType("success");
    } catch {
      setToastMessage("Could not copy the link");
      setToastType("error");
    }
    setShowToast(true);
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        setProfileError("Only image files (JPEG, PNG, GIF, WebP) are allowed");
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setProfileError("");
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError("");

    if (
      usernameChanged &&
      (usernameFormatError || usernameResult?.available === false)
    ) {
      setProfileError(usernameFormatError || usernameResult.reason);
      return;
    }

    setProfileSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("fullName", fullName);
      formData.append("email", email);
      formData.append("bio", bio);
      if (usernameChanged) formData.append("username", username);
      if (imageFile) formData.append("image", imageFile);

      const res = await updateProfile(formData);

      // Update AuthContext and localStorage with new user data
      login(token, res.data.user);

      setToastMessage("Profile updated successfully!");
      setToastType("success");
      setShowToast(true);

      setImageFile(null);
      setImagePreview(null);
      setIsEditingProfile(false);
    } catch (err) {
      const data = err.response?.data;
      setProfileError(
        data?.errors?.[0]?.message ||
          data?.message ||
          "Failed to update profile",
      );
    } finally {
      setProfileSubmitting(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSubmitting(true);

    try {
      await changePassword({ currentPassword, newPassword });

      setToastMessage("Password changed successfully!");
      setToastType("success");
      setShowToast(true);

      handleCancelPassword();
    } catch (err) {
      const data = err.response?.data;
      setPasswordError(
        data?.errors?.[0]?.message ||
          data?.message ||
          "Failed to change password",
      );
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const inputClass = (enabled) =>
    `w-full px-4 py-3 border rounded-lg outline-none transition ${
      enabled
        ? "border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        : "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
    }`;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 py-10">
      <div className="max-w-2xl mx-auto px-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your personal information</p>
        </div>

        {/* Current Profile Info */}
        <div className="bg-white rounded-2xl shadow p-6 flex items-center gap-5">
          <img
            src={user?.image}
            alt={user?.fullName}
            className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-100"
          />
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-gray-900">
              {user?.fullName}
            </h2>
            {user?.username && (
              <p className="text-indigo-600 text-sm">@{user.username}</p>
            )}
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className="inline-block mt-2 text-xs bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-semibold capitalize">
              {user?.role}
            </span>
            <p className="text-xs text-gray-400 mt-1">
              Member since {new Date(user?.createdAt).toDateString()}
            </p>
            {user?.username && (
              <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                {counts && (
                  <>
                    <button
                      type="button"
                      onClick={() => setListType("followers")}
                      className="hover:underline"
                    >
                      <span className="font-bold text-gray-900">
                        {counts.followersCount}
                      </span>{" "}
                      <span className="text-gray-500">
                        {counts.followersCount === 1 ? "follower" : "followers"}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setListType("following")}
                      className="hover:underline"
                    >
                      <span className="font-bold text-gray-900">
                        {counts.followingCount}
                      </span>{" "}
                      <span className="text-gray-500">following</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleCopyProfileLink}
                  className="inline-flex items-center gap-1.5 text-indigo-600 hover:underline"
                >
                  <FiLink /> Copy profile link
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Update Profile Section */}
        <div className="bg-white rounded-2xl shadow p-6">
          {/* Section Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Update Profile
            </h3>
            {!isEditingProfile ? (
              <button
                onClick={startEditingProfile}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition"
              >
                <FiEdit2 /> Edit
              </button>
            ) : null}
          </div>

          {profileError && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {profileError}
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={isEditingProfile ? fullName : user?.fullName || ""}
                onChange={(e) => setFullName(e.target.value)}
                disabled={!isEditingProfile}
                maxLength={50}
                className={inputClass(isEditingProfile)}
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-4 flex items-center text-gray-400">
                  @
                </span>
                <input
                  type="text"
                  value={isEditingProfile ? username : user?.username || ""}
                  onChange={(e) =>
                    setUsername(e.target.value.toLowerCase().replace(/\s/g, ""))
                  }
                  disabled={!isEditingProfile || usernameLocked}
                  maxLength={20}
                  className={`${inputClass(isEditingProfile && !usernameLocked)} pl-9`}
                />
              </div>

              {isEditingProfile &&
                (usernameLocked ? (
                  <p className="text-xs text-amber-600 mt-1">
                    You can change your username again on{" "}
                    {new Date(user.usernameLockedUntil).toLocaleDateString(
                      undefined,
                      { year: "numeric", month: "long", day: "numeric" },
                    )}
                    .
                  </p>
                ) : usernameChanged ? (
                  usernameFormatError ? (
                    <p className="text-xs text-red-600 mt-1">
                      {usernameFormatError}
                    </p>
                  ) : checkingUsername ? (
                    <p className="text-xs text-gray-500 mt-1">Checking...</p>
                  ) : usernameResult?.available ? (
                    <p className="text-xs text-green-600 mt-1">
                      Username is available
                    </p>
                  ) : usernameResult ? (
                    <p className="text-xs text-red-600 mt-1">
                      {usernameResult.reason}
                    </p>
                  ) : null
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    After you change it, you can't change it again for 30 days.
                    Old profile links will stop working.
                  </p>
                ))}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={isEditingProfile ? bio : user?.bio || ""}
                onChange={(e) => setBio(e.target.value)}
                disabled={!isEditingProfile}
                maxLength={BIO_MAX}
                rows={3}
                placeholder={
                  isEditingProfile ? "Tell people about yourself" : ""
                }
                className={`${inputClass(isEditingProfile)} resize-none`}
              />
              {isEditingProfile && (
                <p className="text-xs text-gray-400 mt-1 text-right">
                  {bio.length}/{BIO_MAX}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={isEditingProfile ? email : user?.email || ""}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!isEditingProfile}
                className={inputClass(isEditingProfile)}
              />
            </div>

            {/* Profile Image - only show when editing */}
            {isEditingProfile && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Image
                </label>
                {imagePreview ? (
                  <div className="relative w-32 h-32">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-32 rounded-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition"
                    >
                      <FiX />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4">
                    <img
                      src={user?.image}
                      alt="Current"
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="profile-image-upload"
                    />
                    <label
                      htmlFor="profile-image-upload"
                      className="cursor-pointer inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100 transition text-sm"
                    >
                      <FiUpload /> Change Image
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons - only show when editing */}
            {isEditingProfile && (
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={profileSubmitting}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {profileSubmitting ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelProfile}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Change Password Section */}
        <div className="bg-white rounded-2xl shadow p-6">
          {/* Section Header */}
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Change Password
            </h3>
            {!isEditingPassword ? (
              <button
                onClick={() => setIsEditingPassword(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition"
              >
                <FiEdit2 /> Edit
              </button>
            ) : null}
          </div>

          {/* Placeholder text when not editing */}
          {!isEditingPassword && (
            <p className="text-gray-400 text-sm">
              Click edit to change your password.
            </p>
          )}

          {isEditingPassword && (
            <>
              {passwordError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {passwordError}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className="space-y-5">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                      <img
                        src={showCurrentPassword ? unsee : see}
                        alt="toggle"
                        className="w-5 h-5"
                      />
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition pr-12"
                      required
                      minLength={5}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                    >
                      <img
                        src={showNewPassword ? unsee : see}
                        alt="toggle"
                        className="w-5 h-5"
                      />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 5 characters
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={passwordSubmitting}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {passwordSubmitting ? "Changing..." : "Change Password"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelPassword}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>

      {listType && user?.username && (
        <FollowListModal
          key={listType}
          username={user.username}
          type={listType}
          onClose={() => setListType(null)}
        />
      )}

      {showToast && (
        <Toast
          message={toastMessage}
          onClose={() => setShowToast(false)}
          type={toastType}
        />
      )}
    </div>
  );
};

export default Profile;
