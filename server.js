////////////////////////////////////////////////////////////////////////////////////
//////////                            Setup                               //////////
////////////////////////////////////////////////////////////////////////////////////

require("dotenv").config();

const path = require("path");
const { MongoClient } = require("mongodb");
const validator = require("validator");
const express = require("express");
const session = require("express-session");
const multer = require("multer");
const bcrypt = require("bcrypt");

const app = express();
const port = 3000;

const uri = process.env.URI;
const client = new MongoClient(uri);

app.use(express.static(path.join(__dirname, "static")));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);




////////////////////////////////////////////////////////////////////////////////////
//////////                      miscellaneous js                          //////////
////////////////////////////////////////////////////////////////////////////////////

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "static/uploads/");
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});





const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Alleen afbeeldingen toegestaan"), false);
    }
  },
});




////////////////////////////////////////////////////////////////////////////////////
//////////                            App.Get                             //////////
////////////////////////////////////////////////////////////////////////////////////

app.get("/", (req, res) => {
  res.render("Pages/index");
});

app.get("/login", (req, res) => {
  res.render("Pages/Login");
});

app.get("/aanvullendeInformatie", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  res.render("Pages/AanvullendeInformatie", { user: req.session.user });
});

app.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).send("Kan niet uitloggen");
    res.redirect("/login");
  });
});







////////////////////////////////////////////////////////////////////////////////////
//////////                         App.Post                               //////////
////////////////////////////////////////////////////////////////////////////////////

app.post("/register", upload.single("profileFoto"), async (req, res) => {
  try {
    const db = client.db("StreetracerApp");
    const users = db.collection("users");

    // Extract inputs
    let username = req.body["reg-gebruikersnaam"];
    let email = req.body.email;
    let phone = req.body["reg-telefoonnummer"];
    let dob = req.body.dob;
    let gender = req.body["reg-geslacht"];
    let password = req.body["reg-password"];
    let confirm_password = req.body["reg-wachtwoord-bevestigen"];

    const errors = [];

    // === Username validation ===
    const usernamePattern = /^[a-zA-Z0-9_-]{3,30}$/;
    if (!usernamePattern.test(username)) {
      errors.push("Gebruikersnaam moet 3-30 tekens zijn en mag alleen letters, cijfers, _ of - bevatten.");
    }

    // === Email validation ===
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      errors.push("Ongeldig e-mailadres.");
    }
    email = validator.normalizeEmail(email);

    // === Phone validation ===
    const phonePattern = /^\+?[0-9]{7,15}$/;
    if (!phonePattern.test(phone)) {
      errors.push("Telefoonnummer ongeldig. Alleen cijfers en optioneel + toegestaan.");
    }

    // === Date of birth validation ===
    if (!validator.isDate(dob)) {
      errors.push("Geboortedatum ongeldig.");
    }

    // === Gender validation ===
    if (!["man", "vrouw"].includes(gender)) {
      errors.push("Ongeldig geslacht.");
    }

    // === Password validation ===
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@#$%^&+=]{8,}$/;
    if (!passwordPattern.test(password)) {
      errors.push("Wachtwoord moet minimaal 8 tekens bevatten, inclusief hoofdletter, kleine letter, cijfer en veilige symbolen (@#$%^&+=).");
    }

    // Confirm password
    if (password !== confirm_password) {
      errors.push("Wachtwoorden komen niet overeen.");
    }

    // If there are errors, return them
    if (errors.length > 0) {
      return res.status(400).send(errors.join("\n"));
    }

    // Check if username or email already exists
    const existingUser = await users.findOne({ username });
    if (existingUser) return res.status(400).send("Gebruikersnaam is al in gebruik");

    const existingEmail = await users.findOne({ email });
    if (existingEmail) return res.status(400).send("Email is al geregistreerd");

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Profile photo
    const profilePhoto = req.file ? "/uploads/" + req.file.filename : null;

    // Insert user
    const result = await users.insertOne({
      username: validator.escape(username),
      email,
      phone,
      password: hashedPassword,
      dob,
      gender,
      profilePhoto,
      createdAt: new Date(),
    });

    // Start session
    req.session.user = {
      id: result.insertedId,
      username,
    };

    res.redirect("/aanvullendeInformatie");

  } catch (error) {
    console.error(error);
    res.status(500).send("Fout bij registreren van gebruiker");
  }
});





app.post("/login", async (req, res) => {
  try {
    const db = client.db("StreetracerApp");
    const users = db.collection("users");

    const { username, password } = req.body;

    // Find the user by username
    const user = await users.findOne({ username });

    if (!user) {
      return res.status(400).send("Gebruiker niet gevonden");
    }

    // Compare hashed password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).send("Wachtwoord is onjuist");
    }

    // Start session
    req.session.user = {
      id: user._id,
      username: user.username,
    };

    // Redirect to protected page
    res.redirect("/aanvullendeInformatie");

  } catch (error) {
    console.error(error);
    res.status(500).send("Fout bij inloggen");
  }
});






////////////////////////////////////////////////////////////////////////////////////
//////////                         Start server                           //////////
////////////////////////////////////////////////////////////////////////////////////

async function startServer() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });

  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}

startServer();