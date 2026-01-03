import { useEffect, useState } from "react";
import { getAllPosts } from "../api/postApi";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await getAllPosts();
        // console.log(res)
        // console.log(res.data)
        // console.log(res.data.posts)
        // Your backend likely returns { data: { posts: [...] } }
        setPosts(res.data.posts);
      } catch (error) {
        console.error("Error fetching posts", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading posts...</p>;

  return (
    <div className="min-h-screen bg-gray-300">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Latest Posts</h1>

        {posts.length === 0 ? (
          <p>No posts Yet</p>
        ) : (
          // The grid frame here
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Here we get all the post using map method from 'post' */}
            {posts.map((post) => (
              <div
                key={post._id} //Here is a unique key(post id) for each post
                className="bg-gray-300 border rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition"
              >
                {/* Post image here */}
                <img
                  src={post.image}
                  alt={post.title}
                  // className="h-48 w-full object-cover"
                  className="h-48 w-full object-cover object-top"
                />

                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{post.title}</h2>

                  <p className="text-gray-600 text-sm mb-3">{post.excerpt}</p>

                  {/* User image and full name here */}
                  <div className="flex items-center gap-2 mt-4">
                    <img
                      src={post.author.image}
                      alt={post.author.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <p className="text-sm text-gray-600">
                      {post.author.fullName}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
