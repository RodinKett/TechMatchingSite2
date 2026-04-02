const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");

const upload = require("../middleware/upload");
const validate = require("../middleware/validate");
const { registerValidation, loginValidation } = require("../validators/authValidator");

// ------------------- GET LOGIN -------------------
router.get("/login", (req, res) => {
  res.render("pages/login", {
    submitted: false,   // page not submitted yet
    errors: {},         // always pass an object
    old: {}             // always pass an object
  });
});

// ------------------- GET LOGOUT -------------------
router.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send("Kan niet uitloggen");
    res.redirect("/login");
  });
});

// ------------------- POST REGISTER -------------------
router.post("/register", upload.single("profileFoto"), registerValidation, validate, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const users = db.collection("users");

    const { "reg-gebruikersnaam": username, email, "reg-password": password, "reg-geboortedatum": dob } = req.body;
    const profileFoto = req.file ? req.file.filename : null;

    // Check username/email existence
    if (await users.findOne({ username })) {
      return res.status(400).render("pages/login", {
        errors: { general: { msg: "Gebruikersnaam bestaat al" } },
        old: req.body,
        submitted: true
      });
    }

    if (await users.findOne({ email })) {
      return res.status(400).render("pages/login", {
        errors: { general: { msg: "Email is al geregistreerd" } },
        old: req.body,
        submitted: true
      });
    }

    if (!profileFoto) {
      return res.status(400).render("pages/login", {
        errors: { profileFoto: { msg: "Profielfoto is verplicht" } },
        old: req.body,
        submitted: true
      });
    }

    // Validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("pages/login", {
        errors: errors.mapped() || {},
        old: req.body,
        submitted: true
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const result = await users.insertOne({
      username,
      email,
      password: hashedPassword,
      dob,
      profielFoto: profileFoto,
      createdAt: new Date()
    });

    req.session.user = { id: result.insertedId, username };
    res.redirect("/aanvullendeInformatie");

  } catch (err) {
    console.error(err);
    res.status(500).send("Fout bij registreren");
  }
});

// ------------------- POST LOGIN -------------------
router.post("/login", loginValidation, validate, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const users = db.collection("users");

    const { username, password } = req.body;

    const user = await users.findOne({ username });

    if (!user) {
      return res.status(400).render("pages/login", {
        errors: { general: { msg: "Gebruiker niet gevonden" } },
        old: req.body,
        submitted: true
      });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).render("pages/login", {
        errors: { general: { msg: "Wachtwoord fout" } },
        old: req.body,
        submitted: true
      });
    }

    // Validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render("pages/login", {
        errors: errors.mapped() || {},
        old: req.body,
        submitted: true
      });
    }

    req.session.user = { id: user._id, username: user.username };
    res.redirect("/aanvullendeInformatie");

  } catch (err) {
    console.error(err);
    res.status(500).send("Login fout");
  }
});

module.exports = router;