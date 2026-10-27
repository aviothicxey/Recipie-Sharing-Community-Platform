const mongoose = require('mongoose');
const BlogPost = require('../models/BlogPost');

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function blogInput(body) {
  return ['title', 'category', 'excerpt', 'content', 'image'].reduce((input, field) => {
    if (body[field] !== undefined) input[field] = body[field];
    return input;
  }, {});
}

async function listBlogs(req, res, next) {
  try {
    const posts = await BlogPost.find().populate('authorId', 'name avatarUrl').sort({ createdAt: -1 });
    return res.json({ data: posts });
  } catch (error) {
    return next(error);
  }
}

async function getBlog(req, res, next) {
  try {
    if (!isValidId(req.params.id)) return res.status(400).json({ message: 'Invalid blog id' });
    const post = await BlogPost.findById(req.params.id).populate('authorId', 'name avatarUrl');
    if (!post) return res.status(404).json({ message: 'Blog post not found' });
    return res.json(post);
  } catch (error) {
    return next(error);
  }
}

async function createBlog(req, res, next) {
  try {
    const post = await BlogPost.create({ ...blogInput(req.body), authorId: req.user._id });
    return res.status(201).json(await post.populate('authorId', 'name avatarUrl'));
  } catch (error) {
    return next(error);
  }
}

module.exports = { listBlogs, getBlog, createBlog };
