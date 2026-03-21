require("dotenv").config();

const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");
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

/////////////////////////////////////////////////////////////////////////

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




////////////////////////////////////////////////////////////////////////////////////
//////////                           Upload                               //////////
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

app.post("/register", upload.single("profileFoto"), async (req, res) => {
  try {
    const db = client.db("StreetracerApp");
    const users = db.collection("users");

    const username = req.body["reg-gebruikersnaam"];
    const email = req.body.email;
    const phone = req.body["reg-telefoonnummer"];
    const dob = req.body.dob;
    const gender = req.body["reg-geslacht"];
    const password = req.body["reg-password"];
    const confirm_password = req.body["reg-wachtwoord-bevestigen"];

    // Check if password is the same 
    if (password !== confirm_password) {
      return res.status(400).send("Wachtwoorden komen niet overeen");
    }

    // Check if email already exists
    const existingUser = await users.findOne({ username });
    if (existingUser) {
      return res.status(400).send("Gebruikersnaam is al in gebruik");
    }

    // Check if email already exists
    const existingEmail = await users.findOne({ email });
    if (existingEmail) {
      return res.status(400).send("Email is al geregistreerd");
    }

    // validate phone number format regex
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).send("Telefoonnummer ongeldig");
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // profielfoto 
    const profilePhoto = req.file ? "/uploads/" + req.file.filename : null;

    //Insert new user
    const result = await users.insertOne({
      username,
      email,
      phone,
      password: hashedPassword,
      dob,
      gender,
      profilePhoto,
      createdAt: new Date(),
    });

    // start session
    req.session.user = {
      id: result.insertedId,
      username,
      email,
      profilePhoto,
    };

    res.redirect("/aanvullendeInformatie");
    
  } catch (error) {
    console.error(error);
    res.status(500).send("Error registering user");
  }
});




/////////////////////////////////////////////////////////////////////////

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