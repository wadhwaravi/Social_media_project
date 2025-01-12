import Notification from "../modules/notificationModel.js";
export const getUserNotifications = async (req, res) => {
  try {
    const notification = await Notification.find({ reciptant: req.user._id })
      .sort({ createdAt: -1 })
      .populate("relatedUser", "name username profilePicture")
      .populate("relatedPost", "contenet image");

    res.status(200).json(notification || []);
  } catch (error) {
    console.log("Error in getUserNotifications " + error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markNotificationAsRead = async (req, res) => {
  const notificationId = req.params.id;
  try {
    const notification = await Notification.findByIdAndUpdate(
      { _id: notificationId, reciptant: req.user._id },
      {
        read: true,
      },
      { new: true }
    );
    res.status(200).json(notification);
  } catch (error) {
    console.log("Error in markNotificationAsRead " + error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteNotification = async (req, res) => {
  const notificationId = req.params.id;
  try {
    const notification = await Notification.findByIdAndDelete({
      _id: notificationId,
      reciptant: req.user._id,
    });
    res.status(200).json(notification);
  } catch (error) {
    console.log("Error in deleteNotification " + error);
    res.status(500).json({ message: "Internal server error" });
  }
};
