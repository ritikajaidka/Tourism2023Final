const Package = require("../model/package");
const Booked = require("../model/booked");
const Tourist = require("../model/tourist");

exports.getAllPackages = (req, res, next) => {

    // let logintype = "none";
    // if (req.session.isAdminLoggedIn) {
    //   logintype = "admin";
    // } else if (req.session.isLoggedIn) {
    //   logintype = "guide";
    // } else if (req.session.isTouristLoggedIn) {
    //   logintype = "tourist";
    // }
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
    Package.find({ status: "approved" })
        .populate("packageGuide")
        .exec()
        .then((packages) => {
            res.render("package/packages", {
                packages: packages,
                profileImage: false,
                user: user,
                logintype: logintype,
            });
        });
};

exports.getPackage = (req, res, next) => {
    // let logintype = "none";
    // if (req.session.isAdminLoggedIn) {
    //   logintype = "admin";
    // } else if (req.session.isLoggedIn) {
    //   logintype = "guide";
    // } else if (req.session.isTouristLoggedIn) {
    //   logintype = "tourist";
    // }
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
    const packageId = req.params.packageId;
    Package.findByIdAndUpdate(
        { _id: packageId },
        { $inc: { packageViews: 1 } },
        { new: true }
    ).exec();
    Package.findById(packageId)

        .populate("packageGuide")
        .exec()
        .then((pack) => {
            res.render("package/singlepackage", {
                pack: pack,
                profileImage: false,
                user: user,
                logintype: logintype,
            });
        });
};

//booking
exports.getBooking = (req, res, next) => {
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
    const packageId = req.params.id;
    Package.findById(packageId)
        .populate("packageGuide")
        .exec()
        .then((pack) => {
            if (!pack) {
                res.redirect("/packages");
            }
            res.render("package/booking", {
                pack: pack,
                profileImage: false,
                user: user,
                logintype: logintype,
            });
        });
};

exports.postBooking = (req, res, next) => {
    const packageId = req.body.packageId;

    const touristId = req.tourist._id;

    const bookingDate = req.body.booking_date;
    const p_name1 = req.body.p_name;
    const p_age1 = req.body.p_age;
    const p1 = {
        name: p_name1,
        age: p_age1,
    };
    const passengerDetails = [p1];
    if (req.body.p_name2) {
        const p2 = {
            name: req.body.p_name2,
            age: req.body.p_age2,
        };

        passengerDetails.push(p2);
    }

    const booking = new Booked({
        packageId: packageId,

        tourist: touristId,
        bookingDate: bookingDate,
        passengerDetails: passengerDetails,
        city: req.body.city,
        state: req.body.state,
        address: req.body.address,
        country: req.body.country,
        pincode: req.body.zip,
        contactNo: req.body.contact,
        totalAmount: req.body.amount * passengerDetails.length,
    });

    booking.save().then((result) => {
        Package.findByIdAndUpdate(packageId, {
            $inc: { packageSlotUsed: passengerDetails.length },
        }).exec();
        Package.findByIdAndUpdate(packageId, {
            $push: { booked: result._id },
        }).exec();
        Tourist.findOneAndUpdate(touristId, {
            $push: { booked: result._id },
        }).exec();

        res.redirect("/packages");
    });
};