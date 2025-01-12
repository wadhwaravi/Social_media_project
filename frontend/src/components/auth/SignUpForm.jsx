import { useState } from "react";
import { useMutation } from "react-query";
import { axiosInstance } from "../../lib/axios";
import { toast } from "react-hot-toast";
import { Loader } from "lucide-react";

const SignUpForm = () => {
  const [name, setname] = useState("");
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const [username, setUsername] = useState("");

  const { mutate: signUpMutation, isLoading } = useMutation({
    mutationFn: async (data) => {
      const res = await axiosInstance.post("/auth/signup", data);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Account created successfully");
    },
    onError: (error) => {
      console.log("Hi error ");
      toast.error(error.response.data.message || "Something went wrong");
    },
  });

  const handleSignUp = (e) => {
    e.preventDefault();
    signUpMutation({ name, username, email, password });
  };
  return (
    <form onSubmit={handleSignUp} className="flex flex-col gap-4">
      <div>
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setname(e.target.value)}
          className="input input-bordered w-full"
          required
        />
      </div>
      <div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="input input-bordered w-full"
          required
        />
      </div>
      <div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setemail(e.target.value)}
          className="input input-bordered w-full"
          required
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Password (6+ char)"
          value={password}
          onChange={(e) => setpassword(e.target.value)}
          className="input input-bordered w-full"
          required
        />
      </div>
      <button type="submit" className="btn btn-primary w-full text-white">
        {isLoading ? (
          <Loader className="size-5 animate-spin" />
        ) : (
          "Agree & Join"
        )}
      </button>
    </form>
  );
};

export default SignUpForm;
