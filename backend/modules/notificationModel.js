import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    reciptant: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    type: {
      type: String,
      required: true,
      enum: ["like", "comment", "connectionAccepted"],
    },
    relatedUser: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    relatedPost: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);
const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
