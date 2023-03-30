const MainPage = require("../model/mainpage");
const Package = require("../model/package");
exports.getMainPage = async (req, res, next) => {
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
    const trendingBlogs = await Package.find({
        status: "approved",
    })
        .sort({ packageViews: -1 })
        .limit(4)
        .exec();
    MainPage.find()
        .then((mainpage) => {
            res.render("pages/landingPage", {
                mainpage: mainpage,
                packages: trendingBlogs,
                pageTitle: "Travel World | Home",
                user: user,
                logintype: logintype,
            });
        })
        .catch((err) => {
            console.log(err);
        });
};