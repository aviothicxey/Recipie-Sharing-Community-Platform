const express = require('express');
const requireAuth = require('../middleware/auth');
const { listBlogs, getBlog, createBlog } = require('../controllers/blog.controller');

const router = express.Router();

router.get('/', listBlogs);
router.get('/:id', getBlog);
router.post('/', requireAuth, createBlog);

module.exports = router;
