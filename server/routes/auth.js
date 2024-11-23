import express from "express";
import {
    register,
    upload ,
    login
 } 
 from "../controllers/auth.js";

const router = express.Router();

// Register route with multer file upload handling
router.post('/register', upload.single('picturePath'), register); // 'picturePath' matches the field name in the frontend
router.post("/login", login);


export default router;
