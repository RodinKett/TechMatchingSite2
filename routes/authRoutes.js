/**
 * Auth Router
 * -----------------------
 * Dit bestand definieert de routes voor gebruikersauthenticatie en registratie.
 * Het biedt de volgende functionaliteit:
 * 
 * 1. GET /login
 *    - Render de loginpagina.
 * 
 * 2. GET /logout
 *    - Logt de gebruiker uit door de sessie te vernietigen en redirect naar /login.
 * 
 * 3. POST /register
 *    - Registreert een nieuwe gebruiker.
 *    - Valideert of de gebruikersnaam al bestaat.
 *    - Hash het wachtwoord met bcrypt.
 *    - Slaat de gebruiker op in de database (MongoDB).
 *    - Slaat de sessie op voor de nieuwe gebruiker.
 * 
 * 4. POST /login
 *    - Logt een bestaande gebruiker in.
 *    - Controleert of de gebruiker bestaat.
 *    - Vergelijkt het opgegeven wachtwoord met het gehashte wachtwoord.
 *    - Slaat de sessie op bij succesvolle login.
 * 
 * Middleware:
 * - upload.single("profileFoto"): gebruikt voor het uploaden van een profielfoto bij registratie.
 */




const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt"); // Voor het hashen en vergelijken van wachtwoorden
const validator = require("validator"); // Voor het ontsmetten van invoer (zoals gebruikersnaam)
const upload = require("../middleware/upload"); // Middleware voor bestand uploaden

// GET loginpagina
router.get("/login", function(req, res) {
  res.render("pages/login"); // Render de loginpagina
});

// GET logout
router.get("/logout", function(req, res) {
  // Vernietig de sessie en redirect naar login
  req.session.destroy(function(err) {
    if (err) return res.status(500).send("Kan niet uitloggen");
    res.redirect("/login");
  });
});

// POST registratie van een nieuwe gebruiker
router.post("/register", upload.single("profileFoto"), async function(req, res) {
  try {
    const db = req.app.locals.db;
    const users = db.collection("users");

    // Formuliergegevens ophalen
    const username = validator.escape(req.body["reg-gebruikersnaam"]);
    const email = req.body.email;
    const password = req.body["reg-password"];
    const dob = req.body["reg-geboortedatum"];
    const profileFoto = req.file ? req.file.filename : null;

    // Check bestaande gebruiker
    const existingUser = await users.findOne({ username });
    if (existingUser) return res.status(400).send("Gebruikersnaam bestaat al");

    // Wachtwoord hashen
    const hashedPassword = await bcrypt.hash(password, 10);

    // Nieuwe gebruiker opslaan
    const result = await users.insertOne({
      username,
      email,
      password: hashedPassword,
      dob,
      profielFoto: profileFoto,
      createdAt: new Date()
    });

    // Sessies
    req.session.user = {
      id: result.insertedId,
      username
    };

    // Redirect naar aanvullende informatie (of homepagina)
    res.redirect("/aanvullendeInformatie");

  } catch (error) {
    console.error(error);
    res.status(500).send("Fout bij registreren");
  }
});

// POST login van een bestaande gebruiker
router.post("/login", async function(req, res) {
  try {
    const db = req.app.locals.db;
    const users = db.collection("users");

    let { username, password } = req.body;

    // Zoek de gebruiker op
    const user = await users.findOne({ username });
    if (!user) return res.status(400).send("Gebruiker niet gevonden");

    // Vergelijk het ingevoerde wachtwoord met het gehashte wachtwoord
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).send("Wachtwoord fout");

    // Sla de gebruiker op in de sessie
    req.session.user = {
      id: user._id,
      username: user.username
    };

    res.redirect("/aanvullendeInformatie");

  } catch (error) {
    console.error(error);
    res.status(500).send("Login fout");
  }
});

// Exporteer de router
module.exports = router;