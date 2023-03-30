module.exports = (req, res, next) => {
  //check login
  if (!req.session.isAdminLoggedIn) {
    return res.redirect("/admin/login");
  }
  next();
};
