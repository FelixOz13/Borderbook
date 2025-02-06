import multer from 'multer';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import cloudinary from 'cloudinary';
import fs from 'fs';
import path from 'path';

// Set up multer storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory to store uploaded files
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Use timestamp for unique filenames
  },
});

// Set up multer upload with file size and type validation
export const upload = multer({
  storage, // Use the storage configuration defined above
  limits: {
    fileSize: 10 * 1024 * 1024, // Limit file size to 10MB
  },
  fileFilter: (req, file, cb) => {
    // Allow only images with specific mime types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true); // Proceed with file upload
    } else {
      cb(new Error('Invalid file type'), false); // Reject file if it's not an allowed type
    }
  },
});

// Configure Cloudinary (This should be done once, and you can move it to a separate config file)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, location, occupation } = req.body;

    // Handle file upload and get Cloudinary URL
    let pictureUrl = '';
    if (req.file) {
      pictureUrl = await uploadToCloudinary(req.file.path); // Upload image and get URL
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create and save the user
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      location,
      occupation,
      picture: pictureUrl,
    });

    const savedUser = await newUser.save();

    // Return success response
    res.status(201).json({
      message: "User registered successfully!",
      user: savedUser,
    });
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).json({ message: `Registration failed: ${error.message}` });
  }
};


/* LOGGING IN */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User does not exist." });
    }

    // Compare provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials." });
    }

    // Create a JWT token with expiration (e.g., 1 hour)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Delete the password field before sending the response
    delete user.password;

    // Send the response with the token and user information
    res.status(200).json({ token, user });
  } catch (err) {
    // Catch any server errors
    console.error(err); // Log error for debugging
    res.status(500).json({ error: err.message });
  }
};
