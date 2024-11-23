import Post from "../models/Post.js";
import User from "../models/User.js";

/* CREATE */
export const createPost = async (req, res) => {
  try {
    const { userId, description, picturePath } = req.body;
    const user = await User.findById(userId);
    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath,
      likes: {},
      comments: [],
    });
    await newPost.save();

    const post = await Post.find();
    res.status(201).json(post);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};


// In your posts controller file (e.g., posts.js)
export const addCommentToPost = async (req, res) => {
  try {
    const { userId, comment } = req.body;
    const { id: postId } = req.params;

    // Log request data
    console.log("Received add comment request with data:", { userId, comment, postId });

    // Find user information for comment's name
    const user = await User.findById(userId);
    if (!user) {
      console.error("User not found:", userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("User found:", user);

    // Find post to add comment
    const post = await Post.findById(postId);
    if (!post) {
      console.error("Post not found:", postId);
      return res.status(404).json({ message: "Post not found" });
    }

    console.log("Post found:", post);

    // Create new comment with all required fields
    const newComment = {
      userId,
      name: `${user.firstName} ${user.lastName}`,
      comment,
      createdAt: new Date(),
    };

    console.log("New comment object:", newComment);

    // Push the comment to the comments array and save
    post.comments.push(newComment);
    await post.save();

    console.log("Comment added and post saved successfully");

    res.status(200).json(post);
  } catch (error) {
    console.error("Error in addCommentToPost function:", error); // Log detailed error
    res.status(500).json({ message: error.message });
  }
};

/* READ */
export const getFeedPosts = async (req, res) => {
  try {
    const post = await Post.find();
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const post = await Post.find({ userId });
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);
    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};
