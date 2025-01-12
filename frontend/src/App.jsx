import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/layout/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import SignupPage from "./pages/auth/SignUpPage.jsx";
import { Toaster } from "react-hot-toast";
import { toast } from "react-hot-toast";
import { useQuery } from "react-query";
import { axiosInstance } from "./lib/axios.js";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import NetworkPage from "./pages/NetwrokPage.jsx";
import { Network } from "lucide-react";
import PostPage from "./pages/PostPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
function App() {
  const { data: authUser, isLoading } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get("/auth/me");
        return res.data;
      } catch (error) {
        if (error.response && error.response.status === 401) {
          return null;
        }
        toast.error(error.response.data.message || "Something went wrong");
        throw error;
      }
    },
  });
  if (isLoading) {
    return null;
  }

  return (
    <>
      <Layout>
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          <Route
            path="/"
            element={authUser ? <HomePage /> : <Navigate to={"/login"} />}
          />
          <Route
            path="/signup"
            element={!authUser ? <SignupPage /> : <Navigate to="/" />}
          />

          <Route
            path="/login"
            element={!authUser ? <LoginPage /> : <Navigate to="/" />}
          />
          <Route
            path="/notifications"
            element={
              !authUser ? <Navigate to="/login" /> : <NotificationsPage />
            }
          />
          <Route
            path="/network"
            element={!authUser ? <Navigate to="/login" /> : <NetworkPage />}
          />
          <Route
            path="/post/:postId"
            element={!authUser ? <Navigate to="/login" /> : <PostPage />}
          />
          <Route
            path="/profile/:username"
            element={!authUser ? <Navigate to="/login" /> : <ProfilePage />}
          />
        </Routes>
      </Layout>
    </>
  );
}

export default App;
