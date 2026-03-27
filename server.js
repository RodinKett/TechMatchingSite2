////////////////////////////////////////////////////////////////////////////////////
//////////                            Setup                               //////////
////////////////////////////////////////////////////////////////////////////////////

require("dotenv").config();

const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");
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
  }),
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

app.get("/updateAccount", (req, res) => {
  res.render("Pages/updateAccount");
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

    let { username, password } = req.body;
    const errors = [];

    // Username validation
    const usernamePattern = /^[a-zA-Z0-9_-]{3,30}$/;
    if (!usernamePattern.test(username)) {
      errors.push("Ongeldige gebruikersnaam.");
    }

    // Password validation
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@#$%^&+=]{8,}$/;
    if (!passwordPattern.test(password)) {
      errors.push("Wachtwoord voldoet niet aan de eisen.");
    }

    if (errors.length > 0) {
      return res.status(400).send(errors.join("\n"));
    }

    username = validator.escape(username);

    const user = await users.findOne({ username });

    if (!user) {
      return res.status(400).send("Gebruiker niet gevonden");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).send("Wachtwoord is onjuist");
    }

    req.session.user = {
      id: user._id,
      username: user.username
    };

    res.redirect("/aanvullendeInformatie");

  } catch (error) {
    console.error(error);
    res.status(500).send("Fout bij inloggen");
  }
});




app.post("/aanvullendeInformatie", async (req, res) => {
  try {

    if (!req.session.user) {
      return res.redirect("/login");
    }

    const errors = [];

    const skillLevel = req.body.skillLevel;
    const jarenErvaring = req.body.jarenErvaring;
    const specialisatie = req.body.specialisatie;

    const jaartalVoertuig = req.body.jaartalVoertuig;
    const merkVoertuig = req.body["merkVoertuig-api"];
    const voertuigModel = req.body["voertuig-api"];
    const opmerkingen = req.body.aanvullendeOpmerkingen;

    // Skill level
    if (!["beginer", "bekend", "expert"].includes(skillLevel)) {
      errors.push("Ongeldig skill level.");
    }

    // Jaren ervaring
    if (!/^[0-9]{1,2}$/.test(jarenErvaring)) {
      errors.push("Jaren ervaring moet 0-99 zijn.");
    }

    // Specialisatie
    if (specialisatie && !/^[a-zA-Z\s-]{3,30}$/.test(specialisatie)) {
      errors.push("Specialisatie mag alleen letters bevatten.");
    }

    // Jaartal voertuig
    if (!/^[0-9]{4}$/.test(jaartalVoertuig)) {
      errors.push("Jaartal voertuig moet 4 cijfers zijn.");
    }

    // Opmerkingen
    if (opmerkingen && !/^[a-zA-Z0-9\s.,!?]{0,150}$/.test(opmerkingen)) {
      errors.push("Opmerkingen bevatten ongeldige tekens.");
    }

    if (errors.length > 0) {
      return res.status(400).send(errors.join("\n"));
    }

    const db = client.db("StreetracerApp");
    const users = db.collection("users");

    const userId = new ObjectId(req.session.user.id);

    await users.updateOne(
      { _id: userId },
      {
        $set: {
          skillLevel,
          jarenErvaring,
          specialisatie,
          voertuig: {
            jaartal: jaartalVoertuig,
            merk: merkVoertuig,
            model: voertuigModel,
            opmerkingen
          }
        }
      }
    );

    res.redirect("/");

  } catch (error) {
    console.error(error);
    res.status(500).send("Fout bij opslaan aanvullende gegevens");
  }
});






////////////////////////////////////////////////////////////////////////////////////
//////////                         Start server                           //////////
////////////////////////////////////////////////////////////////////////////////////

app.use(express.static(path.join(__dirname, "static")));

app.get("/", (req, res) => {
  res.render("Pages/index");
});

app.get("/loadingpage", (req, res) => {
  res.render("Pages/loadingpage");
});


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
