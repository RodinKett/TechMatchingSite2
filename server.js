/**
 * Hoofdserverbestand (app.js)
 * -----------------------
 * Dit bestand start de Express-server, configureert middleware, routes en 
 * verbindt met de MongoDB-database.
 * 
 * Functionaliteit:
 * 1. Laadt environment variables via dotenv.
 * 2. Verbindt met MongoDB en maakt de database beschikbaar via app.locals.db.
 * 3. Configureert Express:
 *    - Statische bestanden in "static" map
 *    - EJS als view engine
 *    - JSON- en URL-encoded body parsing
 *    - Sessiebeheer met express-session
 * 4. Importeert en gebruikt routes:
 *    - /api -> apiRoutes
 *    - / -> authRoutes & userRoutes
 * 5. Definieert basisroutes:
 *    - / -> indexpagina
 *    - /loadingpage -> loadingpagina
 * 6. Start de server op poort 3000
 */

/////connectie met data/////
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);


require("dotenv").config(); // Load environment variables

const path = require("path");
const { MongoClient } = require("mongodb");
const express = require("express");
const session = require("express-session");

// Routes importeren
const apiRoutes = require("./routes/apiRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const port = 3000;


app.use('/uploads', express.static('static/uploads'));


const uri = process.env.URI;
const client = new MongoClient(uri);


// nodig om met hotspot te kunnen werken///////
require("node:dns/promises").setServers(["1.1.1.1","8.8.8.8"]);


// ------------------- Middleware -------------------
// Statische bestanden serveren vanuit de "static" map

app.use(express.static(path.join(__dirname, "static")));

// EJS als view engine instellen
app.set("view engine", "ejs");

// Body parsing middleware       
// Body parsing middleware leest en converteert de request body (bijv. JSON of form-data) naar een bruikbaar object voor de server.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessies configureren
app.use(
  session({
    secret: process.env.SESSION_SECRET, // secret voor sessie
    resave: false, // sessie niet opnieuw opslaan als deze niet veranderd is
    saveUninitialized: false, // niet opslaan van lege sessies
  }),
);

// ------------------- Routes -------------------
// API routes
app.use("/api", apiRoutes);

// Auth routes (login, register, logout)
app.use("/", authRoutes);

// User routes (aanvullende info, update account)
app.use("/", userRoutes);

// Basis routes
app.get("/", (req, res) => {
  res.render("pages/index");
});


app.get("/filter", (req, res) => {
  res.render("pages/filter");
});




// ------------------- Feedback handeling ------------------
app.get("/loadingpage", (req, res) => {
  res.render("pages/loadingpage");
});

app.use((req, res) => {
  res.status(404).render("pages/404");
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
    const profielFoto = req.file ? "/uploads/" + req.file.filename : null;

    // Insert user
    const result = await users.insertOne({
      username: validator.escape(username),
      email,
      phone,
      password: hashedPassword,
      dob,
      gender,
      profielFoto,
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

app.get("/profiel", (req, res) => {
  res.render("Pages/profiel");
});





// ---------------------
// MATCHING ROUTE
// ---------------------
app.get("/matching", async (req, res) => {
  try {
    const db = client.db("StreetracerApp");
    const gebruikers = db.collection("users");

    const q = req.query;
    const meerdere = (val) => Array.isArray(val) ? val : [val];

   const query = {
  ...(q.jaartal && { "voertuig.jaartal": q.jaartal }),
  ...(q.skillLevel && { skillLevel: { $in: meerdere(q.skillLevel) } }),
  ...(q.wielaandrijving && { "voertuig.aandrijving": { $in: meerdere(q.wielaandrijving) } }),
  ...(q.specialisatie && { specialisatie: { $in: meerdere(q.specialisatie) } }),
  ...(q.jarenErvaring && { jarenErvaring: q.jarenErvaring }),
  ...(q.mods && { "voertuig.opmerkingen": { $in: meerdere(q.mods) } }),
  ...((q.pkVan || q.pkTot) && { "voertuig.pk": { ...(q.pkVan && { $gte: q.pkVan }), ...(q.pkTot && { $lte: q.pkTot }) } }),
};

    const data = await gebruikers.find(query).toArray();

    console.log("MongoDB query:", query);
    console.log("Gevonden gebruikers:", data.length);
    console.log("Eerste gebruiker:", data[0]);

    const users = data.map(user => ({
      id: user._id.toString(),
      profielFoto: user.profielFoto || "-",
      username: user.username || "Onbekend",
      merk: user.voertuig?.merk || "-",
      model: user.voertuig?.model || "-",
      jaartal: user.voertuig?.jaartal || "-",
      pk: user.voertuig?.pk || "-",
      aandrijving: user.voertuig?.aandrijving || "-",
      mods: user.voertuig?.opmerkingen || "-",
      specialisatie: user.specialisatie || "-",
      jarenErvaring: user.jarenErvaring + " jaar" || "-",
      skillLevel: user.skillLevel || "-",
      opmerkingen: user.opmerkingen || "Geen opmerkingen",
    }));

    res.render("Pages/matching", { users });

  } catch (err) {
    console.error("Fout bij ophalen matching-profielen:", err);
    res.status(500).send("Er ging iets mis bij het ophalen van de profielen.");
  }
});



app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("pages/500");
});


// ------------------- Server starten -------------------
app.locals.db = client.db("StreetracerApp"); // database beschikbaar maken in routes

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