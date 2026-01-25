import { FaHome } from "react-icons/fa";

const WelcomeCard = ({ user }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 p-6 text-white shadow-lg">
      {/* Decorative blur */}
      <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/20 blur-3xl"></div>

      <div className="flex items-center gap-3">
        <FaHome className="h-8 w-8 text-white/90" />

        <h2 className="text-3xl font-bold">Welcome back, {user.fullName}</h2>
      </div>

      <p className="mt-2 text-indigo-100">
        Member since {new Date(user.createdAt).toDateString()}
      </p>
    </div>
  );
};

export default WelcomeCard;
