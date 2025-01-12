import { useParams } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import { useQuery } from "react-query";
import Post from "../components/Post";
import Sidebar from "../components/SideBar";
const PostPage = () => {
  const { postId } = useParams();
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const { data: post, isLoading: isLoading } = useQuery({
    queryKey: ["post", postId],
    queryFn: async () => {
      const res = await axiosInstance.get(`/posts/${postId}`);
      return res;
    },
  });
  if (isLoading) return <div>Loading...</div>;
  if (!post?.data) return <div>Post not found</div>;
  // to do make the post reaction work in post page
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="hidden lg:block lg:col-span-1">
        <Sidebar user={authUser} />
      </div>

      <div className="col-span-1 lg:col-span-3">
        <Post post={post.data} />
      </div>
    </div>
  );
};
export default PostPage;
