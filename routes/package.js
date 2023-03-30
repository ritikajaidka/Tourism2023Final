const router = require("express").Router();
const packageController = require("../controller/package");
const isTouristAuth = require("../middleware/isTouristAuth");
const isTouristLoggedIn = require("../middleware/isTouristLoggedIn");
router.get("/packages", packageController.getAllPackages);

router.get("/package/:packageId", packageController.getPackage);
router.get("/booking/:id", isTouristLoggedIn, packageController.getBooking);

router.post("/booking", isTouristLoggedIn, packageController.postBooking);

module.exports = router;
