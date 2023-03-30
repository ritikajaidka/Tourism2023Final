const Guide = require("../model/guide");
const Tourist = require("../model/tourist");
const Blog = require("../model/blog");
const fs = require("fs");
const Comment = require("../model/comment");
const fileHelper = require("../util/file");
const Reply = require("../model/reply");
//post a blog
exports.postBlog = (req, res, next) => {
    const bimage = req.file;
    if (!bimage) {
        return res.redirect("/guide/addblog");
    }
    const { btitle, bdesc, btags } = req.body;
    //   return console.log(btitle, bdesc, btags);
    const b1 = new Blog({
        blogTitle: btitle,
        blogTag: btags,
        blogContent: bdesc,
        blogImage: req.file.filename,
        blogAuthor: req.guide._id,
    });

    b1.save((err, b) => {
        if (err) {
            console.log(err);
            return res.redirect("/guide/dashboard");
        }
        Guide.findById(req.guide._id).then((guide) => {
            guide.blogs.push(b);
            guide.save();
        });
        return res.redirect("/guide/bloglist");
    });
};

exports.deleteBlog = async (req, res, next) => {
    const bId = req.body.bId;

    await Blog.findByIdAndRemove(bId)
        .then(async (b) => {
            if (!b) {
                throw "Not found";
            }
            if (b.blogAuthor.equals(req.guide._id)) {
                const g = await Guide.findByIdAndUpdate(req.guide._id, {
                    $pull: { blogs: b._id },
                });
                const pathImg = "upload/images/" + b.blogImage;
                if (fs.existsSync(pathImg)) {
                    fileHelper.deleteFiles(pathImg);
                }
            } else {
                console.log("You are not allowed!");
            }
        })
        .catch((err) => {
            console.log(err);
        });
    res.redirect("/guide/bloglist");
};

//globlal
exports.getMainBlogList = async (req, res, next) => {
    let logintype = "none";
    let user = null;
    if (req.session.isAdminLoggedIn) {
        logintype = "admin";
        user = req.admin;
    } else if (req.session.isLoggedIn) {
        logintype = "guide";
        user = req.guide;
    } else if (req.session.isTouristLoggedIn) {
        logintype = "tourist";
        user = req.tourist;
    }
    //latest blogs
    const guide = req.guide;
    // return console.log(guide);
    const trendingBlogs = await Blog.find({
        status: "approved",
    })
        .sort({ blogViews: -1 })
        .populate("blogAuthor")
        .limit(4)
        .exec();
    // return console.log(trendingBlogs);

    Blog.find({
        $and: [{ status: "approved" }],
    })
        .sort({ createdAt: -1 })
        .populate("blogAuthor")
        // .limit(3)
        .exec()
        .then((blogs) => {
            // return console.log(blogs);
            res.render("blogs", {
                guide: req.guide,
                blogs: blogs,
                logintype: logintype,
                user: user,
                trendingBlogs: trendingBlogs,
            });
        });
};

exports.getBlogById = async (req, res, next) => {
    let logintype = "none";
    let user = null;
    if (req.session.isAdminLoggedIn) {
        logintype = "admin";
        user = req.admin;
    } else if (req.session.isLoggedIn) {
        logintype = "guide";
        user = req.guide;
    } else if (req.session.isTouristLoggedIn) {
        logintype = "tourist";
        user = req.tourist;
    }
    const bId = req.params.bId;
    let likedilkeAction = false;
    if (req.tourist) {
        const tourist = await Tourist.findById(req.tourist._id);

        likedilkeAction = tourist.blogsAction.find((b) => {
            return b.blog.equals(bId);
        });
    }
    var nextBlog = await Blog.findOne({ _id: { $gt: bId } });
    var prevBlog = await Blog.findOne({ _id: { $lt: bId } });
    var count = await Blog.countDocuments({ status: "approved" });
    const blogs = await Blog.find({ status: "approved" });
    var random = Math.floor(Math.random() * count);
    if (!nextBlog) {
        nextBlog = blogs[random];
    }
    if (!prevBlog) {
        prevBlog = blogs[random];
    }
    // return console.log(likedilkeAction);
    //count views
    Blog.findByIdAndUpdate(bId, { $inc: { blogViews: 1 } }).exec();
    Blog.findOne({ _id: bId })
        .populate("blogAuthor")
        .populate("comments")
        .populate({
            path: "comments",
            populate: {
                path: "commentAuthorTourist",
                model: "Tourist",
            },
        })
        .populate({
            path: "comments",
            populate: {
                path: "commentAuthorGuide",
                model: "Guide",
            },
        })
        .populate({
            path: "comments",
            populate: {
                path: "replies",
                model: "Reply",
            },
        })
        .populate({
            path: "comments",
            populate: {
                path: "replies",
                populate: {
                    path: "replyAuthorTourist",
                    model: "Tourist",
                },
            },
        })
        .populate({
            path: "comments",
            populate: {
                path: "replies",
                populate: {
                    path: "replyAuthorGuide",
                    model: "Guide",
                },
            },
        })

        .exec()
        .then((blog) => {
            if (blog.status !== "approved") {
                return res.redirect("/blogs");
            }
            // return console.log(blog.comments);
            res.render("singleblog", {
                guide: req.guide,
                tourist: req.tourist,
                blog: blog,
                isview: false,
                nextBlog: nextBlog,
                prevBlog: prevBlog,
                logintype: logintype,
                likedilkeAction: likedilkeAction,
                isGuideAuth: req.isGuideAuth,
                isTouristAuth: req.isTouristAuth,
                user: user,
            });
        });
};

exports.postLikeDislike = async (req, res, next) => {
    const blogId = req.body.blogId;
    const likedislike = req.body.likedislike;

    const tourist = await Tourist.findById(req.tourist._id);

    const blogAction = tourist.blogsAction.find((b) => {
        return b.blog.equals(blogId);
    });
    // return console.log(blogAction);

    if (!blogAction) {
        //add like or dislike

        Tourist.findByIdAndUpdate(req.tourist._id, {
            $push: {
                blogsAction: {
                    blog: blogId,
                    likedislike: likedislike,
                },
            },
        }).exec();

        //update blog likes or dislikes

        if (likedislike === "like") {
            Blog.findByIdAndUpdate(blogId, {
                $inc: { likes: 1 },
            }).exec();
        } else {
            Blog.findByIdAndUpdate(blogId, {
                $inc: { dislikes: 1 },
            }).exec();
        }
    } else {
        if (blogAction.likedislike === likedislike) {
            //remove the same
            const blog = await Blog.findById(blogId);
            if (blog.dislikes !== 0 || likedislike === "like") {
                Tourist.findByIdAndUpdate(req.tourist._id, {
                    $pull: {
                        blogsAction: {
                            blog: blogId,
                            likedislike: likedislike,
                        },
                    },
                }).exec();
                //decrement likes or dislikes
                if (likedislike === "like") {
                    Blog.findByIdAndUpdate(blogId, {
                        $inc: { likes: -1 },
                    }).exec();
                } else {
                    Blog.findByIdAndUpdate(blogId, {
                        $inc: { dislikes: -1 },
                    }).exec();
                }
            } else {
                return res.redirect("/blogs/" + blogId);
            }
        } else {
            //remove and add toggle
            Tourist.findByIdAndUpdate(req.tourist._id, {
                $pull: {
                    blogsAction: {
                        blog: blogId,
                        likedislike: blogAction.likedislike,
                    },
                },
            }).exec();

            Tourist.findByIdAndUpdate(req.tourist._id, {
                $push: {
                    blogsAction: {
                        blog: blogId,
                        likedislike: likedislike,
                    },
                },
            }).exec();

            //increment and decrement likes or dislikes
            if (likedislike === "like") {
                Blog.findByIdAndUpdate(blogId, {
                    $inc: { likes: 1 },
                }).exec();

                Blog.findByIdAndUpdate(blogId, {
                    $inc: { dislikes: -1 },
                }).exec();
            } else {
                Blog.findByIdAndUpdate(blogId, {
                    $inc: { likes: -1 },
                }).exec();

                Blog.findByIdAndUpdate(blogId, {
                    $inc: { dislikes: 1 },
                }).exec();
            }
        }
    }

    res.redirect("/blog/" + blogId);
};

//fetch query
exports.getBlogByTag = async (req, res, next) => {
    let logintype = "none";
    let user = null;
    if (req.session.isAdminLoggedIn) {
        logintype = "admin";
        user = req.admin;
    } else if (req.session.isLoggedIn) {
        logintype = "guide";
        user = req.guide;
    } else if (req.session.isTouristLoggedIn) {
        logintype = "tourist";
        user = req.tourist;
    }
    const trendingBlogs = await Blog.find({
        status: "approved",
    })
        .sort({ blogViews: -1 })
        .populate("blogAuthor")
        .limit(4)
        .exec();
    Blog.find({ blogTag: tag, status: "approved" })
        .sort({ createdAt: -1 })
        .populate("blogAuthor")
        .exec()
        .then((blogs) => {
            if (!blogs) {
                return res.redirect("/blogs");
            }
            res.render("blogs", {
                guide: req.guide,
                blogs: blogs,
                logintype: logintype,
                trendingBlogs: trendingBlogs,
                user: user,
            });
        });
};

//search blog
exports.getBlogBySearch = async (req, res, next) => {
    let logintype = "none";
    let user = null;
    if (req.session.isAdminLoggedIn) {
        logintype = "admin";
        user = req.admin;
    } else if (req.session.isLoggedIn) {
        logintype = "guide";
        user = req.guide;
    } else if (req.session.isTouristLoggedIn) {
        logintype = "tourist";
        user = req.tourist;
    }
    const search = req.body.search;
    const trendingBlogs = await Blog.find({
        status: "approved",
    })

        .sort({ blogViews: -1 })
        .populate("blogAuthor")
        .limit(4)
        .exec();
    Blog.find({
        $or: [
            { blogTitle: { $regex: search, $options: "i" } },
            { blogContent: { $regex: search, $options: "i" } },
        ],
        status: "approved",
    })
        .sort({ createdAt: -1 })
        .populate("blogAuthor")
        .exec()
        .then((blogs) => {
            if (!blogs) {
                blogs = [];
            }
            res.render("blogs", {
                guide: req.guide,
                blogs: blogs,
                logintype: logintype,
                trendingBlogs: trendingBlogs,
                user: user,
            });
        });
};

exports.postComment = (req, res, next) => {
    const blogId = req.body.blogId;
    const comment = req.body.comment;
    const authType = req.body.authType;
    //return console.log(authType, comment, blogId);

    if (authType === "guide") {
        const c = new Comment({
            commentContent: comment,
            commentAuthorGuide: req.guide._id,
            commentAuthorType: "guide",
            commentBlog: blogId,
        });
        return c
            .save()
            .then((result) => {
                Blog.findByIdAndUpdate(blogId, {
                    $push: {
                        comments: result._id,
                    },
                }).exec();
            })
            .then(() => {
                res.redirect("/blog/" + blogId);
            });
    } else {
        const c = new Comment({
            commentContent: comment,
            commentAuthorTourist: req.tourist._id,
            commentAuthorType: "tourist",
            commentBlog: blogId,
        });

        c.save((err, result) => {
            if (err) {
                return res.redirect("/blogs/" + blogId);
            }
            Blog.findById(blogId)
                .then((blog) => {
                    blog.comments.push(result._id);
                    blog.save();
                })
                .catch((err) => {
                    console.log(err);
                });
        });
    }
    res.redirect("/blog/" + blogId);
};

exports.postReply = (req, res, next) => {
    const commentId = req.body.commentId;
    const reply = req.body.reply;
    const replyAuthorType = req.body.replyAuthorType;
    const blogId = req.body.blogId;
    const replyAuthorId = req.body.replyAuthorId;

    if (replyAuthorType === "guide") {
        const r = new Reply({
            replyContent: reply,
            replyAuthorGuide: replyAuthorId,
            replyAuthorType: "guide",
            replyComment: commentId,
        });
        return r

            .save()
            .then((result) => {
                Comment.findById(commentId)
                    .then((comment) => {
                        comment.replies.push(result._id);
                        comment.save();
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            })
            .then(() => {
                res.redirect("/blog/" + blogId);
            });
    } else {
        const r = new Reply({
            replyContent: reply,
            replyAuthorTourist: replyAuthorId,
            replyAuthorType: "tourist",
            replyComment: commentId,
        });
        return r
            .save()
            .then((result) => {
                Comment.findById(commentId)
                    .then((comment) => {
                        comment.replies.push(result._id);
                        comment.save();
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            })
            .then(() => {
                res.redirect("/blog/" + blogId);
            });
    }
};