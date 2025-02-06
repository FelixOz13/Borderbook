import multer from 'multer';
import cloudinary from 'cloudinary';
import Post from "../models/Post.js";
import User from "../models/User.js";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup for memory storage
const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage: storage });

// CREATE POST
export const createPost = async (req, res) => {
  try {
    const { userId, description } = req.body;

    // Validate inputs
    if (!description) {
      return res.status(400).json({ message: "Description is required" });
    }

    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle image upload to Cloudinary
    let pictureUrl = '';
    if (req.file) {
      // Upload the image file to Cloudinary
      const result = await cloudinary.v2.uploader.upload_stream(
        { resource_type: "auto" },
        (error, uploadResult) => {
          if (error) {
            return res.status(500).json({ message: 'Error uploading image to Cloudinary', error });
          }

          // Assign the Cloudinary URL if upload is successful
          pictureUrl = uploadResult.secure_url;
        }
      );

      // Upload the file buffer to Cloudinary
      const bufferStream = new stream.PassThrough();
      bufferStream.end(req.file.buffer); // Pass the file buffer to Cloudinary stream
      bufferStream.pipe(result);
    }

    // Create the new post object
    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath: pictureUrl, // Save the Cloudinary URL for the image
      likes: {},
      comments: [],
    });

    // Save the post to the database
    await newPost.save();

    res.status(201).json(newPost);
  } catch (err) {
    console.error("Error in createPost:", err);
    res.status(500).json({ message: "An error occurred while creating the post", error: err.message });
  }
};

// ADD COMMENT TO POST
export const addCommentToPost = async (req, res) => {
  try {
    const { userId, comment } = req.body;
    const { id: postId } = req.params;

    // Validate comment length
    if (!comment || comment.length > 500) {
      return res.status(400).json({ message: "Comment is required and must be less than 500 characters" });
    }

    // Fetch user information
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the post to add the comment
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Create new comment
    const newComment = {
      userId,
      name: `${user.firstName} ${user.lastName}`,
      comment,
      createdAt: new Date(),
    };

    // Add the comment to the post and save
    post.comments.push(newComment);
    await post.save();

    res.status(200).json(post);
  } catch (error) {
    console.error("Error in addCommentToPost:", error);
    res.status(500).json({ message: "An error occurred while adding the comment", error: error.message });
  }
};

// READ ALL POSTS (Feed)
export const getFeedPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (err) {
    console.error("Error in getFeedPosts:", err);
    res.status(500).json({ message: "Unable to fetch posts", error: err.message });
  }
};

// READ USER POSTS
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ userId });
    res.status(200).json(posts);
  } catch (err) {
    console.error("Error in getUserPosts:", err);
    res.status(500).json({ message: "Unable to fetch user posts", error: err.message });
  }
};

// UPDATE (LIKE POST)
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    // Find the post by ID
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Toggle like status
    if (post.likes.has(userId)) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    // Save the updated post
    const updatedPost = await post.save();

    res.status(200).json(updatedPost);
  } catch (err) {
    console.error("Error in likePost:", err);
    res.status(500).json({ message: "An error occurred while liking the post", error: err.message });
  }
};
