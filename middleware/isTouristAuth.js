module.exports = (req, res, next) => {
  //check login
  if (req.session.isTouristLoggedIn) {
    return res.redirect("/tourist/dashboard");
  }
  next();
};
