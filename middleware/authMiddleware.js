/**
 * Auth Middleware
 * -----------------------
 * Dit bestand bevat middleware voor gebruikersauthenticatie.
 * 
 * Functionaliteit:
 * - isLoggedIn:
 *    Controleert of een gebruiker ingelogd is door te kijken naar de sessie.
 *    - Als de gebruiker ingelogd is, gaat de request verder naar de volgende middleware of route.
 *    - Als de gebruiker niet ingelogd is, wordt deze doorgestuurd naar de loginpagina.
 * 
 * Gebruik in routes:
 * const { isLoggedIn } = require("../middleware/authMiddleware");
 * router.get("/aanvullendeInformatie", isLoggedIn, (req, res) => { ... });
 */




function isLoggedIn(req, res, next) {
  if (req.session.user) {
    // Gebruiker is ingelogd, ga door naar de volgende middleware/route
    return next();
  } else {
    // Gebruiker niet ingelogd, redirect naar loginpagina
    return res.redirect("/login");
  }
}

module.exports = { isLoggedIn };