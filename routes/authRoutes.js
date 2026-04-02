/**
 * Auth Router
 * -----------------------
 * Dit bestand definieert de routes voor gebruikersauthenticatie en registratie.
 * 
 * Functionaliteit:
 * 
 * 1. GET /login
 *    - Render de loginpagina.
 * 
 * 2. GET /logout
 *    - Vernietigt de sessie en logt de gebruiker uit.
 * 
 * 3. POST /register
 *    - Valideert invoer
 *    - Controleert bestaande gebruikers
 *    - Hash wachtwoord
 *    - Slaat gebruiker op in MongoDB
 *    - Start een sessie
 * 
 * 4. POST /login
 *    - Valideert logingegevens
 *    - Controleert wachtwoord
 *    - Start een sessie
 */

const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const { ObjectId } = require("mongodb");

const upload = require("../middleware/upload");
const validate = require("../middleware/validate");
const { validationResult } = require("express-validator");

const { registerValidation, loginValidation } = require("../validators/authValidator");


// ------------------- GET LOGIN -------------------

router.get("/login", function(req, res) {
  res.render("pages/login", { 
    submitted: false  // Dit is de initiële pagina, geen submit geweest
  });
});



// ------------------- GET LOGOUT -------------------
router.get("/logout", function(req, res) {

  req.session.destroy(function(err) {

    if (err) {
      return res.status(500).send("Kan niet uitloggen");
    }

    res.redirect("/login");

  });

});


// ------------------- POST REGISTER -------------------
router.post( "/register", upload.single("profileFoto"), registerValidation, validate, async function(req, res) {
  try {
    const db = req.app.locals.db;
    const users = db.collection("users");

    const username = req.body["reg-gebruikersnaam"];
    const email = req.body.email;
    const password = req.body["reg-password"];
    const dob = req.body["reg-geboortedatum"];
    const profileFoto = req.file ? req.file.filename : null;

    // Controleer bestaande username
    const existingUser = await users.findOne({ username });

    if (existingUser) {
      return res.status(400).render("pages/login", {
        errors: { general: { msg: "Gebruikersnaam bestaat al" } },
        old: req.body,
    submitted: true
      });
    }

    // Controleer bestaande email
    const existingEmail = await users.findOne({ email });

    if (existingEmail) {
      return res.status(400).render("pages/login", {
        errors: { general: { msg: "Email is al geregistreerd" } },
        old: req.body,
    submitted: true
      });
    }

    if (!req.file) {
      return res.status(400).render("pages/login", {
        errors: { profileFoto: { msg: "Profielfoto is verplicht" } },
        old: req.body,
    submitted: true
      });
    }

    const errors = validationResult(req);
    // Error authValidator
    if (!errors.isEmpty()) {
      return res.status(400).render("pages/login", {
        errors: errors.mapped(),
        old: req.body,
  
      });
    }


    // Hash wachtwoord
    const hashedPassword = await bcrypt.hash(password, 10);

    // Nieuwe gebruiker
    const result = await users.insertOne({
      username,
      email,
      password: hashedPassword,
      dob,
      profielFoto: profileFoto,
      createdAt: new Date()
    });

    // Start sessie
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


// ------------------- POST LOGIN -------------------
router.post( "/login", loginValidation, validate, async function(req, res) {
  try {
    const db = req.app.locals.db;
    const users = db.collection("users");

    const username = req.body.username;
    const password = req.body.password;

    // Zoek gebruiker
    const user = await users.findOne({ username });

    if (!user) {
      return res.status(400).render("pages/login", {
        errors: { general: { msg: "Gebruiker niet gevonden" } },
        old: req.body,
    submitted: true
      });
    }

    // Vergelijk wachtwoord
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).render("pages/login", {
        errors: { general: { msg: "Wachtwoord fout" } },
        old: req.body,
    submitted: true
      });
    }

    const errors = validationResult(req);
    // Error authValidator
    if (!errors.isEmpty()) {
      return res.status(400).render("pages/login", {
        errors: errors.mapped(),
        old: req.body,
    submitted: true
      });
    }

    // Sessiestart
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


// ------------------- EXPORT -------------------
module.exports = router;