const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

// File filter (images only)
const checkFileType = (file, cb) => {
    const filetypes = /jpg|jpeg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Error: Only Images (JPG, JPEG, PNG, WEBP) are allowed');
    }
};

const upload = multer({
    storage,
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    },
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// @desc    Upload an image
// @route   POST /api/upload
// @access  Private/Admin
router.post('/', protect, authorize('admin'), upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    // We return the full URL if possible, or just the relative path
    const fullPath = `/uploads/${req.file.filename}`;
    res.status(200).json({ 
        success: true, 
        message: 'Image uploaded successfully', 
        path: fullPath
    });
});

module.exports = router;
