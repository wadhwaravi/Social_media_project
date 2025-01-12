import Post from "../modules/postModel.js";
import cloudinary from "../lib/cloudinary.js";
import Notification from "../modules/notificationModel.js";
export const getFeedPosts = async (req, res) => {
  try {
    const post = await Post.find({
      author: { $in: [...req.user.connections, req.user._id] },
    })
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(post);
  } catch (error) {
    console.log("Error in getFeedPosts " + error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createPost = async (req, res) => {
  try {
    const { content, image } = req.body;
    let newPost;
    if (image) {
      const result = await cloudinary.uploader.upload(image);
      newPost = await Post.create({
        content,
        image: result.secure_url,
        author: req.user._id,
      });
    } else {
      newPost = await Post.create({ content, author: req.user._id });
    }
    res.status(201).json(newPost);
  } catch (error) {
    console.log("Error in createPost " + error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = await req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (post.image) {
      // todo later
      await cloudinary.uploader.destroy(
        post.image.split("/").pop().split(".")[0]
      );
    }
    await post.deleteOne();
    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    console.log("Error in deletePost " + error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId)
      .populate("author", "name username profilePicture headline")
      .populate("comments.user", "name profilePicture username headline");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    console.log("Error in getPostById " + error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const createComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;
    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: { comments: { user: req.user._id, content } },
      },
      { new: true }
    ).populate("author", "name username profilePicture headline");
    // creata a notification if comment owner is not post owner
    if (post.author.toString() !== req.user._id) {
      const newNotification = await Notification.create({
        reciptant: post.author,
        type: "comment",
        relatedUser: req.user._id,
        relatedPost: post._id,
      });
      await newNotification.save();
      // todo senda an email
      try {
        const postUrl = process.env.CLIENT_URL + "/post/" + post._id;
        await sendCommentNotificationEmail(
          post.author.email,
          post.author.name,
          req.user.name,
          postUrl,
          content
        );
      } catch (error) {
        console.log("Error in sendCommentNotificationEmail " + error);
      }
    }
    res.status(200).json(post);
  } catch (error) {
    console.log("Error in createComment " + error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;
    const post = await Post.findById(postId);
    if (post.likes.includes(userId)) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
      // create a new notification
      if (post.author._id.toString() !== req.user._id.toString()) {
        const newNotification = await Notification.create({
          reciptant: post.author,
          type: "like",
          relatedUser: userId,
          relatedPost: postId,
        });
        await newNotification.save();
      }
    }
    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.log("Error in likePost " + error);
    res.status(500).json({ message: "Internal server error" });
  }
};
