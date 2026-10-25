
const express = require('express');
const multer = require('multer');
const cloudinary = require('../config/cloudinary');
const requireAuth = require('../middleware/auth');

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1
    },
    fileFilter: (req, file, callback) => {
        const allowedTypes = [
            'image/jpeg',
            'image/png',
            'image/webp'
        ];

        if (!allowedTypes.includes(file.mimetype)) {
            return callback(
                new Error('Only JPG, PNG and WEBP images are allowed')
            );
        }

        callback(null, true);
    }
});

router.post('/image', requireAuth, (req, res, next) => {
    upload.single('image')(req, res, async (error) => {
        if (error) {
            error.statusCode = 400;
            return next(error);
        }

        if (!req.file) {
            return res.status(400).json({
                message: 'Please select an image'
            });
        }

        try {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'recipe-platform',
                        resource_type: 'image'
                    },
                    (err, uploadedImage) => {
                        if (err) return reject(err);
                        resolve(uploadedImage);
                    }
                );

                stream.end(req.file.buffer);
            });

            return res.status(201).json({
                message: 'Image uploaded successfully',
                imageUrl: result.secure_url,
                publicId: result.public_id
            });
        } catch (err) {
            console.error('Cloudinary upload failed:', err.message);
            return res.status(502).json({
                message: 'Image upload failed'
            });
        }
    });
});

module.exports = router;
