const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const validator = require("validator");
const upload = require("../middleware/upload");

// GET routes
router.get("/login", (req, res) => {
  res.render("Pages/Login");
});

router.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send("Kan niet uitloggen");
    res.redirect("/login");
  });
});


// REGISTER
router.post("/register", upload.single("profileFoto"), async (req, res) => {
  try {

    const db = req.app.locals.db;
    const users = db.collection("users");

    let username = req.body["reg-gebruikersnaam"];
    let email = req.body.email;
    let password = req.body["reg-password"];

    const existingUser = await users.findOne({ username });
    if (existingUser) return res.status(400).send("Gebruikersnaam bestaat al");

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await users.insertOne({
      username: validator.escape(username),
      email,
      password: hashedPassword
    });

    req.session.user = {
      id: result.insertedId,
      username
    };

    res.redirect("/aanvullendeInformatie");

  } catch (error) {
    console.error(error);
    res.status(500).send("Fout bij registreren");
  }
});


// LOGIN
router.post("/login", async (req, res) => {
  try {

    const db = req.app.locals.db;
    const users = db.collection("users");

    let { username, password } = req.body;

    const user = await users.findOne({ username });

    if (!user) return res.status(400).send("Gebruiker niet gevonden");

    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(400).send("Wachtwoord fout");

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

module.exports = router;