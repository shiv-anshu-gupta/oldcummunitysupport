// middlewares/authMiddleware.js
function isNgoAuthenticated(req, res, next) {
  if (req.session.ngo) {
    return next();
  }
  return res.redirect("/ngo/login");
}

function isUserAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  return res.redirect("/user/login");
}

module.exports = {
  isNgoAuthenticated,
  isUserAuthenticated,
};
