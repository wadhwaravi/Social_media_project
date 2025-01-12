import User from "../modules/userModel.js";
import cloudinary from "../lib/cloudinary.js";
export const getSuggestedConnections = async (req, res) => {
  try {
    const currUser = User.findById(req.user._id).select("connections");

    const suggestedUsers = await User.find({
      _id: { $ne: req.user._id, $nin: currUser.connections },
    })
      .select("name username profilePicture headline")
      .limit(3);

    res.json(suggestedUsers);
  } catch (error) {
    console.log("Error in getSuggestedConnections" + error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPublicProfile = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.log("Error in getPublicProfile" + error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "headline",
      "profilePicture",
      "bannerImg",
      "about",
      "skills",
      "experience",
      "education",
      "location",
      "username",
    ];
    const updatedData = {};
    for (const field of allowedFields) {
      if (req.body[field]) {
        updatedData[field] = req.body[field];
      }
    }
    // todo check for profile and banner images
    if (req.body.profilePicture) {
      const result = await cloudinary.uploader.upload(req.body.profilePicture);
      updatedData.profilePicture = result.secure_url;
    }
    if (req.body.bannerImg) {
      const result = await cloudinary.uploader.upload(req.body.profilePicture);
      updatedData.bannerImg = result.secure_url;
    }
    const user = await User.findById(req.user._id);
    user.set(updatedData);
    await user.save();
    res.json(user);
  } catch (error) {
    console.error("Error in updateProfile" + error);
    res.status(500).json({ message: "Internal server error" });
  }
};
