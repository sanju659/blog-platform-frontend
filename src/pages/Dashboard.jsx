import { useEffect, useState } from "react";
import { getMe } from "./../api/authAPi";
import { getMyPosts } from "./../api/postApi";

import WelcomeCard from "../components/WelcomeCard";
import StatsCards from "../components/StatsCards";
import QuickActions from "../components/QuickActions";
import RecentPosts from "../components/RecentPosts";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  // Fetching the dashboard data from the backend ->> database
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userRes = await getMe();
        setUser(userRes.data);

        const postsRes = await getMyPosts();
        // "postsRes.data.posts" is the array of object
        setPosts(postsRes.data.posts || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDashboardData();
  }, []);

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
