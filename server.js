require("./db/db");
const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoDBstore = require("connect-mongodb-session")(session);
const PORT = 5000;
require("dotenv").config();
//model
const Guide = require("./model/guide");
const Tourist = require("./model/tourist");

const dbUrl = "mongodb://0.0.0.0:27017/tourist";
const app = express();

//guide session
const oSessionStore = new MongoDBstore({
  //calling constructor
  uri: dbUrl,
  collection: "usersessions",
});

//routes
const guideRoute = require("./routes/guide");
const adminRoute = require("./routes/admin");
const touristRoute = require("./routes/tourist");
const publicRoute = require("./routes/publicCon");
const blogRoute = require("./routes/blog");
const packageRoute = require("./routes/package");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use("/profile", express.static("upload/images"));
//session setup for guide
app.use(
  session({
    secret: "Guide and Tourist is awsome",
    resave: false,
    saveUninitialized: false,
    store: oSessionStore,
  })
);

//guide store
app.use((req, res, next) => {
  if (!req.session.guide) {
    return next();
  }
  Guide.findById(req.session.guide._id)
    .then((guide) => {
      req.guide = guide;
      req.isGuideAuth = true;
      next();
    })
    .catch((err) => console.log(err));
});
//local variable
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  next();
});

//tourist session
app.use((req, res, next) => {
  if (!req.session.tourist) {
    return next();
  }
  Tourist.findById(req.session.tourist._id)
    .then((tourist) => {
      req.tourist = tourist;
      req.isTouristAuth = true;
      next();
    })
    .catch((err) => console.log(err));
});
//local variable for tourist
app.use((req, res, next) => {
  res.locals.isTouristAuthenticated = req.session.isTouristLoggedIn;
  next();
});

//admin login
app.use((req, res, next) => {
  if (!req.session.admin) {
    return next();
  }
  req.admin = {
    adminname: process.env.ADMIN_ID,
    adminpass: process.env.ADMIN_PASS,
  };
  next();
});
app.use((req, res, next) => {
  res.locals.isAdminAuthenticated = req.session.isAdminLoggedIn;
  next();
});

app.use(publicRoute);
// app.get("/passwordforgot", (req, res) => {
//   res.render("pages/forgotPage");
// });
// app.get("/recoverpassword", (req, res) => {
//   res.render("pages/recoverpassword");
// });
app.use("/guide", guideRoute);
app.use("/admin", adminRoute);
app.use("/tourist", touristRoute);
app.use(packageRoute);
app.use(blogRoute);

// app.get("/faq", (req, res) => {
//   let logintype = "none";
//   if (req.session.isAdminLoggedIn) {
//     logintype = "admin";
//   } else if (req.session.isLoggedIn) {
//     logintype = "guide";
//   } else if (req.session.isTouristLoggedIn) {
//     logintype = "tourist";
//   }
//   res.render("pages/feq", { guide: req.guide, logintype: logintype });
// });

app.get("/guide/booking", (req, res) => {
  res.render("guide/booking_details", {
    guide: req.guide,
    profileImage: false,
  });
});

app.get("/login_as", (req, res) => {
  res.render("pages/allLogin");
});

app.get("/about", (req, res) => {
  let logintype = "none";
  if (req.session.isAdminLoggedIn) {
    logintype = "admin";
  } else if (req.session.isLoggedIn) {
    logintype = "guide";
  } else if (req.session.isTouristLoggedIn) {
    logintype = "tourist";
  }
  res.render("pages/aboutus", { admin: req.admin, logintype: logintype });
});
app.use((req, res) => {
  res.status(404).render("pages/error404");
});
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
