import { useMutation, useQueryClient } from "react-query";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";
import { Link } from "react-router-dom";
const FriendRequest = ({ request }) => {
  const queryClient = new useQueryClient();
  const { mutate: acceptConnectionRequest } = useMutation({
    mutationFn: async (requestId) => {
      await axiosInstance.put(`/connections/accept/${requestId}`);
    },
    onSuccess: () => {
      toast.success("Connection request accepted");
      queryClient.invalidateQueries({
        queryKey: ["connectionRequests"],
      });
    },
    onError: (error) => {
      toast.error(error.response.data.error);
    },
  });
  const { mutate: rejectConnectionRequest } = useMutation({
    mutationFn: async (requestId) => {
      await axiosInstance.put(`/connections/reject/${requestId}`);
    },
    onSuccess: () => {
      toast.success("Connection request rejected");
      queryClient.invalidateQueries({
        queryKey: ["connectionRequests"],
      });
    },
    onError: (error) => {
      toast.error(error.response.data.error);
    },
  });
  return (
    <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between transition-all hover:scale-md">
      <div className="flex items-center gap-4">
        <Link to={`/profile/${request.sender.username}`}>
          <img
            src={request.sender.profilePicture || "/avatar.png"}
            alt={request.sender.name}
            className="w-12 h-12 rounded-full"
          />
        </Link>
        <div>
          <Link
            to={`/profile/${request.sender.username}`}
            className="font-semibold text-lg"
          >
            {request.sender.name}
          </Link>
        </div>
      </div>
      <div className="space-x-2">
        <button
          className="bg-primary text-white px-4 py-2 rounded-full"
          onClick={() => acceptConnectionRequest(request._id)}
        >
          Accept
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded-full"
          onClick={() => rejectConnectionRequest(request._id)}
        >
          Reject
        </button>
      </div>
    </div>
  );
};

export default FriendRequest;
