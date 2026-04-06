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
const fs = require("fs");

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

app.get("/api/car-brands", async (req, res) => {
  try {
    const response = await fetch("https://www.carqueryapi.com/api/0.3/?cmd=getMakes");
    const text = await response.text();

    const data = JSON.parse(text.replace("var data = ", "").replace(";", ""));

    res.json(data.Makes);
  } catch (err) {
    res.status(500).json({ error: "Het laden van merken is mislukt." });
  }
});

app.get("/api/car-models/:make/:year", async (req, res) => {
  const { make, year } = req.params;

  try {
    const response = await fetch(
      `https://www.carqueryapi.com/api/0.3/?cmd=getModels&make=${make}&year=${year}`
    );

    const text = await response.text();
    const data = JSON.parse(text.replace("var data = ", "").replace(";", ""));

    res.json(data.Models);
  } catch (err) {
    res.status(500).json({ error: "Modellen laden mislukt." });
  }
});

app.get("/api/car-specs/:make/:model/:year", async (req, res) => {
  const { make, model, year } = req.params;

  try {
    const response = await fetch(
      `https://www.carqueryapi.com/api/0.3/?cmd=getTrims&make=${make}&model=${model}&year=${year}`
    );

    const text = await response.text();
    const data = JSON.parse(text.replace("var data = ", "").replace(";", ""));

    res.json(data.Trims);
  } catch (err) {
    res.status(500).json({ error: "Specificaties laden mislukt" });
  }
});

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

app.get("/updateAccount", async (req, res) => {

  if (!req.session.user) {
    return res.redirect("/login");
  }

  const db = client.db("StreetracerApp");
  const users = db.collection("users");

  const user = await users.findOne({
    _id: new ObjectId(req.session.user.id)
  });

  res.render("Pages/updateAccount", { user });

});

app.get("/filter", (req, res) => {
  res.render("Pages/filter");
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
    if (!["man", "vrouw", "anders"].includes(gender)) {
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
    const profileFoto = req.file ? "/uploads/" + req.file.filename : null;

    // Insert user
    const result = await users.insertOne({
      username: validator.escape(username),
      email,
      phone,
      password: hashedPassword,
      dob,
      gender,
      profileFoto,
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

    const pk = req.body.pk;
    const gewicht = req.body.gewicht;
    const aandrijving = req.body.aandrijving;

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
            pk: pk,
            gewicht: gewicht,
            aandrijving: aandrijving,
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





app.post("/updateAccount", upload.single("profileFoto"), async (req, res) => {

  if (!req.session.user) {
    return res.redirect("/login");
  }

  const db = client.db("StreetracerApp");
  const users = db.collection("users");

  const userId = new ObjectId(req.session.user.id);

  const user = await users.findOne({ _id: userId });

  const username = req.body["update-gebruikersnaam"];
  const email = req.body.email;
  const phone = req.body["update-telefoonnummer"];
  const dob = req.body.dob;
  const gender = req.body["update-geslacht"];

  const huidigWachtwoord = req.body["huidig-wachtwoord"];
  const nieuwWachtwoord = req.body["nieuw-wachtwoord"];
  const bevestigWachtwoord = req.body["bevestig-wachtwoord"];

  const existingUser = await users.findOne({ username, _id: { $ne: userId } });
  if (existingUser) return res.status(400).send("Gebruikersnaam is al in gebruik");

  const existingEmail = await users.findOne({ email, _id: { $ne: userId } });
  if (existingEmail) return res.status(400).send("Email is al geregistreerd");

  if (!/^\+?[0-9]{7,15}$/.test(phone)) {
    return res.status(400).send("Ongeldig telefoonnummer");
  }

  if (!validator.isDate(dob)) {
    return res.status(400).send("Ongeldige geboortedatum");
  }

  if (!["man", "vrouw", "anders"].includes(gender)) {
    return res.status(400).send("Ongeldig geslacht");
  }

  const updateData = {
    username,
    email,
    phone,
    dob,
    gender
  };


  // wachtwoord update
if (nieuwWachtwoord && nieuwWachtwoord.length > 0) {

  const match = await bcrypt.compare(huidigWachtwoord, user.password);

  if (!match) {
    return res.status(400).send("Huidig wachtwoord is onjuist");
  }

  if (nieuwWachtwoord !== bevestigWachtwoord) {
    return res.status(400).send("Wachtwoorden komen niet overeen");
  }

  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@#$%^&+=]{8,}$/;

  if (!passwordPattern.test(nieuwWachtwoord)) {
    return res.status(400).send("Wachtwoord voldoet niet aan eisen");
  }

  const hashedPassword = await bcrypt.hash(nieuwWachtwoord, 10);
  updateData.password = hashedPassword;

}

  // profiel foto
  if (req.file) {
    // oude foto verwijderen
    if (user.profileFoto) {
      const oldFile = path.basename(user.profileFoto);
      const oldPath = path.join(__dirname, "static/uploads", oldFile);

      fs.unlink(oldPath, (err) => {
        if (err) console.log("Oude foto niet verwijderd:", err);
      });
    }
    updateData.profileFoto = "/uploads/" + req.file.filename;
  }

  await users.updateOne(
    { _id: userId },
    { $set: updateData }
  );

  // Update session values
  req.session.user.username = username;
  if (updateData.profileFoto) {
    req.session.user.profileFoto = updateData.profileFoto;
  }

  res.redirect("/");
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





//////////////////matching pagina met filters en kaarten////////////////////
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
    
    res.status(500).console.log ("Er ging iets mis bij het ophalen van de profielen.");
  }
});

// ---------------------
// SERVER STARTEN + MONGO CONNECTIE
// ---------------------

app.get("/profiel", async (req, res) => {

    try {
    const db = client.db("StreetracerApp");
    const gebruikers = db.collection("users");

const data = await gebruikers.findOne({ _id: new ObjectId(req.session.user.id) });

    console.log("gevonden data:", data);

    const user = {
      id: data._id.toString(),
      profielFoto: data.profielFoto || "-",
      username: data.username || "Onbekend",
      merk: data.voertuig?.merk || "-",
      model: data.voertuig?.model || "-",
      jaartal: data.voertuig?.jaartal || "-",
      pk: data.voertuig?.pk || "-",
      aandrijving: data.voertuig?.aandrijving || "-",
      mods: data.mods || [],
      specialisatie: data.specialisatie || "-",
      jarenErvaring: data.jarenErvaring || "-",
      skillLevel: data.skillLevel || "-",
      opmerkingen: data.opmerkingen || "Geen opmerkingen",
    };

    res.render("Pages/profiel", { user });

  } catch (err) {
    console.error("Fout bij ophalen profiel:", err);
    res.status(500).console.log ("Er ging iets mis bij het ophalen van het profiel.");
  }
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