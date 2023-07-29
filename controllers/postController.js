const Post = require("../models/post");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const Comment = require("../models/comment");

exports.get_posts = asyncHandler(async (req, res, next) => {
  const allPosts = await Post.find({}).sort("-date").exec();
  if (!allPosts.length > 0) {
    return res.json({ err: "No posts found" });
  }
  res.status(200).json({ allPosts });
});

exports.get_single_post = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postId).exec();
  if (post == null) {
    return res
      .status(404)
      .json({ err: `Post with id ${req.params.postId} not found` });
  }
  res.status(200).json({ post });
});

exports.create_post = [
  body("title", "Title cannot be empty").trim().isLength({ min: 1 }).escape(),
  body("text", "Text cannot be empty").trim().isLength({ min: 1 }).escape(),
  body("desc", "Description cannot be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        post: req.body,
        errors: errors.array(),
      });
    }
    const post = new Post({
      title: req.body.title,
      text: req.body.text,
      desc: req.body.desc,
    });
    post.save();
    res.status(200).json({ msg: "Post created" });
  }),
];

exports.update_post = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (post === null) {
    return res.status(404).json({ msg: "Invalid Post" });
  }
  const updatedPost = new Post({
    title: req.body.title,
    text: req.body.text,
    desc: req.body.desc,
    date: Date.now,
    _id: req.params.id,
  });
  await Post.findByIdAndUpdate(req.params.id, updatedPost, {});
  res.status(200).json({ msg: "Updated successfully" });
});

exports.delete_post = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);
  if (!post) {
    return res
      .status(404)
      .json({ err: `Post with id ${req.params.postId} not found` });
  } else {
    if (post.comments.length > 0) {
      await Comment.deleteMany({ _id: { $in: post.comments } });
    }
    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json({ msg: "Post deleted successfully" });
  }
});
