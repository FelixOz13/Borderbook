import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import { register } from './controllers/auth.js';
import { createPost } from './controllers/posts.js';
import { verifyToken } from './middleware/auth.js';

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Set up file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS configuration

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : []; // Default to empty array if ALLOWED_ORIGINS is undefined

  const corsOptions = {
    origin: (origin, callback) => {
      console.log('Origin:', origin); // Debugging the origin
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        console.error(`Blocked by CORS: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  };


// Middleware setup
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('common'));
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use(cors({
  origin: 'https://borderbook.netlify.app', // Replace with your frontend's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
  credentials: true, // Allow cookies and credentials
})); // Apply CORS configuration

// Root route handler
app.get('/', (req, res) => {
  res.send('Welcome to the server!');
});

// Static file serving
app.use('/assets', express.static(path.join(__dirname, './public/assets')));

// File upload configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const savePath = path.join(__dirname, './public/assets');
    console.log('Saving file to:', savePath); // Debugging file path
    cb(null, savePath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage });

// Routes with file uploads
app.post('/auth/register', upload.single('picture'), register);
app.post('/posts', verifyToken, upload.single('picture'), createPost);

// API routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/posts', postRoutes);
app.use('/uploads', express.static('uploads'));

// Serve Frontend
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../', 'frontend', 'build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => res.send('Please set to production'));
}



// Serve the React frontend
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

// Database connection and server startup
const PORT = process.env.PORT || 6001;
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on port: ${PORT}`);
    });

    // Send success message when visiting the root URL
    app.get('/', (req, res) => {
      res.status(200).send('Connected to MongoDB successfully!');
    });

    // Uncomment to seed the database (once)
    // User.insertMany(users);
    // Post.insertMany(posts);
  })
  .catch((error) => console.error(`Connection error: ${error}`));
