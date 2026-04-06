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
 * - upload.single("profielFoto"): gebruikt voor het uploaden van een profielfoto bij registratie.
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
router.post("/register", upload.single("profielFoto"), async (req, res) => {
  try {
    const db = req.app.locals.db;
    const users = db.collection("users");

    const errors = {};

    // --------------------------
    // Sanitize & parse input
    // --------------------------
    const username = req.body["reg-gebruikersnaam"] 
      ? validator.escape(validator.trim(req.body["reg-gebruikersnaam"])) 
      : "";
    const email = req.body.email ? validator.trim(req.body.email) : "";
    const password = req.body["reg-password"] || "";
    const dob = req.body.dob ? validator.trim(req.body.dob) : "";
    const profielFoto = req.file ? req.file.filename : null;

    // --------------------------
    // Validation
    // --------------------------
    if (!username) errors.username = "Vul een gebruikersnaam in.";
    if (!email) errors.email = "Vul een emailadres in.";
    else if (!validator.isEmail(email)) errors.email = "Ongeldig emailadres.";
    
    if (!password || password.length < 6) errors.password = "Wachtwoord moet minimaal 6 tekens zijn.";

    // Profielfoto validation
    if (req.file) {
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(req.file.mimetype)) {
        errors.profielFoto = "Alleen JPG, PNG of WEBP toegestaan voor profielfoto.";
      }
    }

    // Check existing username
    if (username) {
      const existingUser = await users.findOne({ username });
      if (existingUser) errors.username = "Gebruikersnaam bestaat al";
    }

    // Check existing email
    if (email) {
      const existingEmail = await users.findOne({ email });
      if (existingEmail) errors.email = "Email is al geregistreerd";
    }

    // Stop if there are errors
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // --------------------------
    // Hash password & insert
    // --------------------------
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await users.insertOne({
      username,
      email,
      password: hashedPassword,
      dob,
      profielFoto: profielFoto,
      createdAt: new Date()
    });

    // Save session
    req.session.user = {
      id: result.insertedId,
      username
    };

    // Redirect to aanvullendeInformatie
    res.json({ success: true, redirect: "/loadingpage?next=/aanvullendeInformatie" });

  } catch (error) {
    console.error(error);
    console.log("error met het aanmaken van een account")
    res.status(500).render("pages/500");
  }
});

// POST login van een bestaande gebruiker
router.post("/login", async function(req, res) {
  try {
    const db = req.app.locals.db;
    const users = db.collection("users");

    let { username, password } = req.body;
    const user = await users.findOne({ username });

    if (!user) {
      return res.status(400).json({ field: "username", message: "Gebruiker niet gevonden" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ field: "password", message: "Wachtwoord fout" });
    }

    req.session.user = { id: user._id, username: user.username };
    res.json({ success: true, redirect: "/loadingpage?next=/" });

  } catch (error) {
    console.error(error);
    console.log("error met het inloggen")
    res.status(500).render("pages/500");
  }
});

// Exporteer de router
module.exports = router;