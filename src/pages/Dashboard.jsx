import { useEffect, useState } from "react";
import { getMe } from "./../api/authAPi";
import { getMyPosts } from "./../api/postApi";

import WelcomeCard from "../components/WelcomeCard";
import StatsCards from "../components/StatsCards";
import QuickActions from "../components/QuickActions";
import RecentPosts from "../components/RecentPosts";
import Skeleton from "../components/Skeleton";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userRes = await getMe();
        setUser(userRes.data);

        const postsRes = await getMyPosts();
        setPosts(postsRes.data.posts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {user && <WelcomeCard user={user} />}
        <StatsCards posts={posts} />
        <QuickActions />
        <RecentPosts posts={posts.slice(0, 3)} />
      </div>
    </div>
  );
};

export default Dashboard;
