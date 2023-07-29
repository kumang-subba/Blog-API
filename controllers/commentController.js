const Comment = require("../models/comment");
const post = require("../models/post");
const Post = require("../models/post");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.get_comments = asyncHandler(async (req, res, next) => {
  const allComments = await Comment.find({ post: req.params.postId })
    .sort("-date")
    .exec();
  if (!allComments.length > 0) {
    res.status(404).json({ err: "No Comments found" });
  }
  res.status(200).json({ allComments });
});

exports.create_comment = [
  body("text", "Text cannot be empty").trim().isLength({ min: 1 }).escape(),
  body("commenter").trim().escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        comment: req.body,
        errors: errors.array(),
      });
    }
    const comment = new Comment({
      text: req.body.text,
      commenter: req.body.commenter,
      post: req.params.postId,
    });
    await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $push: { comments: comment },
      },
      { safe: true, upsert: true, new: true }
    );
    await comment.save();
    res.status(200).json({ msg: `Comment ${comment._id} added` });
  }),
];

exports.get_single_comment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findById(req.params.commentId);
  if (!comment) {
    return res
      .status(404)
      .json({ err: `Comment ${req.params.commentId} not found` });
  }
  res.status(200).json({ comment });
});

exports.delete_comment = asyncHandler(async (req, res, next) => {
  const comment = await Comment.findByIdAndDelete(req.params.commentId);
  if (!comment) {
    return res
      .status(404)
      .json({ err: `Comment ${req.params.commentId} not found` });
  }
  await Post.findByIdAndUpdate(req.params.postId, {
    $pull: { comments: req.params.commentId },
  });
  res.status(200).json({ msg: `Comment ${req.params.commentId} deleted` });
});
