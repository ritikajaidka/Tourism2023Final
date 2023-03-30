const router = require("express").Router();
const blogController = require("../controller/blog");
const isLoggedin = require("../middleware/isLoggedin");
const isTouristLoggedIn = require("../middleware/isTouristLoggedIn");
const upload = require("../util/upload");

//Guide
router.post(
  "/guide/addblog",
  isLoggedin,
  upload.single("bimage"),
  blogController.postBlog
);
router.post("/guide/deleteblog", isLoggedin, blogController.deleteBlog);
// get by id, by status by tags
router.get("/blogs", blogController.getMainBlogList);
router.get("/blog/:bId", blogController.getBlogById);
router.get("/blog/tag/:tag", blogController.getBlogByTag);
router.post("/blog/search", blogController.getBlogBySearch);
//comments
router.post("/blog/comment", blogController.postComment);
router.post("/blog/reply", blogController.postReply);

//actions
//action
router.post(
  "/blog/likedislike",
  isTouristLoggedIn,
  blogController.postLikeDislike
);

module.exports = router;
