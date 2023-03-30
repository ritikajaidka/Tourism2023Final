require("dotenv").config();
const bcrypt = require("bcrypt");
const Tourist = require("../model/tourist");
const fs = require("fs");
const fileHelper = require("../util/file");
const Booked = require("../model/booked");
const { populate } = require("../model/tourist");
const e = require("express");

exports.getLogin = (req, res, next) => {
  const prevPage = req.get("referer");

  res.render("tourist/login", {
    pageTitle: "Travel World | Toursit Login",
    path: "/login",
    prevPage: prevPage,
  });
};

exports.geterror = (req, res, next) => {
  res.render("tourist/incorrectUP");
};

exports.geterrorPass = (req, res, next) => {
  res.render("tourist/tpassAcpass");
};

exports.geterrorEmail = (req, res, next) => {
  res.render("tourist/temailexists");
};

exports.postLogin = async (req, res, next) => {
  const temail = req.body.temail;
  const tpass = req.body.tpass;
  const prevPage = req.body.prevPage;
  const prevPageUrl = prevPage.split("/");
  Tourist.findOne({ touristEmail: temail })
    .then((tourist) => {
      if (!tourist) {
        return res.redirect("/tourist/login");
      }
      bcrypt
        .compare(tpass, tourist.touristPassword)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isTouristLoggedIn = true;
            req.session.tourist = tourist;
            return req.session.save((err) => {
              if (
                prevPage == "http://" + prevPageUrl[2] + "/login_as" ||
                prevPage == ""
              ) {
                res.redirect("/tourist/dashboard");
              } else {
                res.redirect(prevPage);
              }
            });
          } else {
            res.redirect("/tourist/incorrectUP");
          }
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/tourist/incorrectUP");
        });
    })
    .catch((err) => console.log(err));
};

exports.getSignup = (req, res, next) => {
  res.render("tourist/register", {
    pageTitle: "Travel World | Toursit Signup",
    path: "/signup",
  });
};

exports.postSignup = async (req, res, next) => {
  const { tname, temail, tpass, tpassc } = req.body;

  if (await Tourist.findOne({ touristEmail: temail })) {
    //return res.redirect("/tourist/signup");
    return res.redirect("/tourist/temailexists");
  }

  if (tpass !== tpassc) {
    //return res.redirect("/tourist/signup");
    return res.redirect("/tourist/tpassAcpass");
  } else {
    const hashedPass = await bcrypt.hash(tpass, 12);
    const tourist = new Tourist({
      touristPassword: hashedPass,
      touristEmail: temail,
      touristName: tname,
    });

    tourist.save((err, t) => {
      if (err) {
        console.log(err);
        res.redirect("/tourist/signup");
      }
      res.redirect("/tourist/login");
    });
  }
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    res.redirect("/");
  });
};

exports.getDashboard = (req, res, next) => {
  res.render("tourist/dashboard", {
    pageTitle: "Travel World | Toursit Dashboard",
    path: "/dashboard",
    tourist: req.tourist,
    profileImage: req.tourist.touristImage,
  });
};

exports.getProfile = (req, res, next) => {
  if (!req.tourist.profileComplete) {
    return res.redirect("/tourist/edit-profile");
  }
  res.render("tourist/profile", {
    pageTitle: "Travel World | Toursit Profile",
    path: "/profile",
    tourist: req.tourist,
    profileImage: req.tourist.touristImage,
  });
};

exports.getEditProfile = (req, res, next) => {
  res.render("tourist/editprofile", {
    pageTitle: "Travel World | Toursit Edit Profile",
    path: "/tourist/edit-profile",
    tourist: req.tourist,
    profileImage: req.tourist.touristImage,
  });
};
exports.postEditProfile = (req, res, next) => {
  const profileImage = req.file;

  let image = req.tourist.touristImage;
  if (profileImage) {
    const pathImg = "upload/images/" + image;
    if (image && fs.existsSync(pathImg)) {
      fileHelper.deleteFiles(pathImg);
    }
    image = profileImage.filename;
  }
  //   return console.log(profileImage, image);
  const {
    organization,
    education,
    phone,
    country,
    address,
    name,
    city,
    state,
  } = req.body;
  //   return console.log(req.body);

  Tourist.findOne({ _id: req.tourist._id })
    .then((tourist) => {
      tourist.touristName = name;
      tourist.touristImage = image;
      tourist.touristOrganization = organization;
      tourist.touristEducation = education;
      tourist.touristPhone = phone;
      tourist.touristCountry = country;
      tourist.touristAddress = address;
      tourist.touristCity = city;
      tourist.touristState = state;
      tourist.profileComplete = true;
      return tourist.save();
    })
    .then((result) => {
      res.redirect("/tourist/profile");
    })
    .catch((err) => console.log(err));
};

exports.getBookedPackage = (req, res, next) => {
  const touristId = req.tourist._id;
  Tourist.findById(touristId)
    .populate({
      path: "booked",
      model: "Booked",
      populate: {
        path: "packageId",
        model: "Package",
      },
    })

    .then((tourist) => {
      // console.log(tourist.booked[0].packageId);
      res.render("tourist/bookedPackage", {
        pageTitle: "Travel World | Toursit Booked Package",

        tourist: tourist,
        profileImage: req.tourist.touristImage,
      });
    });
};

exports.getInvoice = (req, res, next) => {
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
  const bookedId = req.body.bookedId;
  Booked.findById(bookedId)
    .populate({
      path: "packageId",
      model: "Package",
      populate: {
        path: "packageGuide",

        model: "Guide",
      },
    })

    .then((booked) => {
      res.render("package/invoice", {
        pageTitle: "Travel World | Toursit Invoice",
        booked: booked,
        user: user,
        logintype: logintype,
      });
    });
};
