import { useParams } from "react-router-dom";
import { useQueryClient, useQuery, useMutation } from "react-query";
import { axiosInstance } from "../lib/axios";
import ProfileHeader from "../components/ProfileHeader";
import AboutSection from "../components/AboutSection";
import ExperienceSection from "../components/ExperienceSection";
import SkillsSection from "../components/SkillsSection";
import EducationSection from "../components/EducationSection";
const ProfilePage = () => {
  const username = useParams().username;

  const queryClient = useQueryClient();
  const { data: authUser, isLoading } = useQuery({ queryKey: ["authUser"] });
  const { data: userProfile, isLoading: isUserProfileLoading } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      const res = await axiosInstance.get(`/users/${username}`);
      return res.data;
    },
  });

  const { mutate: updateProfile } = useMutation({
    mutationFn: async (data) => {
      await axiosInstance.put(`/users/profile`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["userProfile", username]);
    },
  });

  if (isLoading || isUserProfileLoading) return <div>Loading...</div>;
  const isOwnProfile = authUser.username === userProfile.username;

  const userData = isOwnProfile ? authUser : userProfile;
  const handleSave = (data) => {
    updateProfile(data);
  };
  return (
    <div className="max-w-4xl mx-auto p-4">
      <ProfileHeader
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      ></ProfileHeader>
      <AboutSection
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      ></AboutSection>
      <ExperienceSection
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      ></ExperienceSection>
      <EducationSection
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      ></EducationSection>
      <SkillsSection
        userData={userData}
        isOwnProfile={isOwnProfile}
        onSave={handleSave}
      ></SkillsSection>
    </div>
  );
};

export default ProfilePage;
