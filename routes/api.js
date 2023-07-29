var express = require("express");
var router = express.Router();
const post_controller = require("../controllers/postController");
const passport = require("passport");
const admin_controller = require("../controllers/adminController");
const comment_controller = require("../controllers/commentController");

/* Redirect to posts */
router.get("/", function (req, res, next) {
  res.redirect("/api/posts");
});

// Create post
router.post(
  "/posts",
  passport.authenticate("jwt", { session: false }),
  post_controller.create_post
);

// Get all posts
router.get("/posts", post_controller.get_posts);

// Get post by id
router.get("/posts/:postId", post_controller.get_single_post);

// Update post by id
router.put(
  "/posts/:id",
  passport.authenticate("jwt", { session: false }),
  post_controller.update_post
);

// Delete post
router.delete(
  "/posts/:postId",
  passport.authenticate("jwt", { session: false }),
  post_controller.delete_post
);

// Create a new comment
router.post("/posts/:postId/comments", comment_controller.create_comment);

// Get all comments of a post
router.get("/posts/:postId/comments", comment_controller.get_comments);

// Get a specific comment
router.get(
  "/posts/:postId/comments/:commentId",
  comment_controller.get_single_comment
);

// Delete a specific comment
router.delete(
  "/posts/:postId/comments/:commentId",
  passport.authenticate("jwt", { session: false }),
  comment_controller.delete_comment
);

// Create admin
router.post("/sign-up", admin_controller.sign_up);

// Admin login
router.post("/login", admin_controller.login);

// Admin logout
router.get("logout", admin_controller.log_out);

module.exports = router;
