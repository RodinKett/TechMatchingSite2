// middleware/authMiddleware.js

function isLoggedIn(req, res, next) {
  if (req.session.user) {
    return next(); // user is logged in, proceed
  } else {
    return res.redirect("/login"); // not logged in, redirect
  }
}

module.exports = { isLoggedIn };