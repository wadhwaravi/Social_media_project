import ConnectionRequest from "../modules/connectionRequestModel.js";
import User from "../modules/userModel.js";
import Notification from "../modules/notificationModel.js";
export const sendConnectionRequest = async (req, res) => {
  try {
    const userId = req.user._id;
    const senderId = req.params.userId;
    if (senderId.toString() === userId.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot send a connection request to yourself" });
    }
    if (req.user.connections.includes(senderId)) {
      return res
        .status(400)
        .json({ message: "You are already connected with this user" });
    }
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { sender: userId, reciptant: senderId, status: "pending" },
        { sender: senderId, reciptant: userId, status: "pending" },
      ],
    });
    if (existingRequest) {
      return res
        .status(400)
        .json({ message: "Connection request already exists" });
    }
    const request = await ConnectionRequest.create({
      sender: userId,
      reciptant: senderId,
    });
    await request.save();
    res.status(200).json({ message: "Connection request sent" });
  } catch (error) {
    console.log("Error in sendConnectionRequest " + error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  try {
    const requestId = req.params.userId;
    const userId = req.user._id;
    const request = await ConnectionRequest.findById(requestId)
      .populate("sender", "name username profilePicture")
      .populate("reciptant", "name username profilePicture");
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.reciptant._id.toString() !== userId.toString()) {
      return res
        .status(400)
        .json({ message: "You are not authorized to accept this request" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already accepted" });
    }
    request.status = "accepted";
    await request.save();
    //. if i am your friend and your also my friend
    await User.findByIdAndUpdate(request.sender._id, {
      $addToSet: { connections: request.reciptant._id },
    });
    await User.findByIdAndUpdate(request.reciptant._id, {
      $addToSet: { connections: request.sender._id },
    });
    const notification = new Notification({
      reciptant: request.sender._id,
      type: "connectionAccepted",
      relatedUser: userId,
    });
    await notification.save();
    res.status(200).json({ message: "Request accepted", request: request });
    // todo send email
    const senderEmail = request.sender.email;
    const senderName = request.sender.name;

    const reciptantName = request.reciptant.name;
    const profileUrl = process.env.CLIENT_URL + "/profile/" + request.username;
    try {
      await sendConnectionRequestAcceptedEmail(
        senderEmail,
        senderName,
        reciptantName,
        profileUrl
      );
    } catch (error) {
      console.log("Error in sendConnectionRequestAcceptedEmail " + error);
    }
  } catch (error) {
    console.log("Error in acceptConnectionRequest " + error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const rejectConnectionRequest = async (req, res) => {
  try {
    const requestId = req.params.userId;
    const request = await ConnectionRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already accepted" });
    }
    request.status = "rejected";
    await request.save();
    res.status(200).json({ message: "Request rejected", request: request });
  } catch (error) {
    console.log("Error in rejectConnectionRequest " + error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getConnectionRequests = async (req, res) => {
  try {
    const requests = await ConnectionRequest.find({
      reciptant: req.user._id,
      status: "pending",
    })
      .populate("sender", "name username profilePicture headline")
      .populate("reciptant", "name username profilePicture");
    res.status(200).json(requests);
  } catch (error) {
    console.log("Error in getConnectionRequests " + error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserConnection = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate(
      "connections",
      "name username profilePicture headline connections"
    );
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.connections || []);
  } catch (error) {
    console.log("Error in getUserConnections " + error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const removeConnection = async (req, res) => {
  try {
    const userId = req.params.userId;
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { connections: userId },
    });
    await User.findByIdAndUpdate(userId, {
      $pull: { connections: req.user._id },
    });
    res.status(200).json({ message: "Connection removed" });
  } catch (error) {
    console.log("Error in removeConnection " + error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getConnectionStatus = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currUserId = req.user._id;
    const curruentUser = req.user;
    if (curruentUser.connections.includes(targetUserId)) {
      return res.status(200).json({ message: "connected" });
    }
    const pendingRequest = await ConnectionRequest.findOne({
      $or: [
        { sender: currUserId, reciptant: targetUserId },
        {
          sender: targetUserId,
          reciptant: currUserId,
        },
      ],
      status: "pending",
    });
    if (pendingRequest) {
      if (pendingRequest.sender.toString() === currUserId.toString()) {
        return res.status(200).json({ message: "pending" });
      } else {
        return res
          .status(200)
          .json({ message: "received", requestId: pendingRequest._id });
      }
    }

    // if no connection or pending request found meand not connected
    return res.status(200).json({ message: "Not connected" });
  } catch (error) {
    console.log("Error in getConnectionStatus " + error);
    res.status(500).json({ message: "Internal server error" });
  }
};
