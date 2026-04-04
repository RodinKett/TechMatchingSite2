/**
 * User Account Router
 * -----------------------
 * Dit bestand beheert routes voor het beheren van aanvullende informatie en 
 * accountgegevens van ingelogde gebruikers.
 * 
 * Functionaliteit:
 * 1. GET /aanvullendeInformatie
 *    - Render pagina om aanvullende gebruikersinformatie in te vullen of te bekijken.
 * 
 * 2. GET /updateAccount
 *    - Render pagina om accountgegevens te wijzigen (gebruikersnaam, email, telefoon, wachtwoord, etc.).
 * 
 * 3. POST /aanvullendeInformatie
 *    - Valideert en slaat aanvullende informatie op, zoals skill level, voertuiggegevens en opmerkingen.
 * 
 * 4. POST /updateAccount
 *    - Valideert en update accountgegevens van de gebruiker.
 *    - Beheert wachtwoordwijzigingen indien gevraagd.
 * 
 * Middleware:
 * - isLoggedIn: zorgt dat de gebruiker ingelogd moet zijn om deze routes te gebruiken.
 */



const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const validator = require("validator");
const { isLoggedIn } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

router.get("/aanvullendeInformatie", isLoggedIn, function(req, res) { 
  res.render("pages/aanvullendeInformatie"); // Render de loginpagina
});

router.get("/updateAccount", isLoggedIn, function(req, res) {
  res.render("pages/updateAccount"); // Render de loginpagina
});


// ------------------- POST /aanvullendeInformatie -------------------
router.post("/aanvullendeInformatie", isLoggedIn, upload.single("profileFoto"), async function(req, res) {
  try {
    const errors = [];

    // Sanitize en converteer numeriek
    const jarenErvaringNum = Number(req.body.jarenErvaring);
    const specialisatie = ([]).concat(req.body.specialisatie || []).map(s => validator.escape(validator.trim(s)));
    const opmerkingen = validator.escape(validator.trim(req.body.aanvullendeOpmerkingen || ""));

    const jaartalVoertuigNum = Number(req.body.jaartalVoertuig);
    const merkVoertuig = validator.escape(validator.trim(req.body["merkVoertuig-api"] || ""));
    const voertuigModel = validator.escape(validator.trim(req.body["voertuig-api"] || ""));
    const pk = Number(req.body.pk) || null;
    const gewicht = Number(req.body.gewicht) || null;
    const aandrijving = validator.escape(validator.trim(req.body.aandrijving || ""));
    const mods = [].concat(req.body.mods || []);

    // Validatie van input
    if (isNaN(jarenErvaringNum) || jarenErvaringNum < 0 || jarenErvaringNum > 99) {
      errors.push("Jaren ervaring moet een getal tussen 0 en 99 zijn.");
    }

    if (isNaN(jaartalVoertuigNum) || jaartalVoertuigNum < 1950 || jaartalVoertuigNum > 2025) {
      errors.push("Jaartal voertuig moet een geldig jaartal tussen 1950 en 2025 zijn.");
    }

    if (errors.length > 0) return res.status(400).send(errors.join("\n"));

    const db = req.app.locals.db;
    const users = db.collection("users");
    const userId = new ObjectId(req.session.user.id);

    // Zorg dat voertuig altijd een object is
    const huidigeVoertuig = (await users.findOne({ _id: userId })).voertuig || {};

    // Update gebruiker
    const updateData = {
      jarenErvaring: jarenErvaringNum,
      specialisatie,
      opmerkingen,
      voertuig: {
        ...huidigeVoertuig,
        jaartal: jaartalVoertuigNum,
        merk: merkVoertuig,
        model: voertuigModel,
        pk,
        gewicht,
        aandrijving,
        mods,
        opmerkingen
      }
    };

    // Profielfoto verwerken
    if (req.file) updateData.profielFoto = req.file.filename;

    await users.updateOne({ _id: userId }, { $set: updateData });

    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Fout bij opslaan aanvullende gegevens");
  }
});

// ------------------- POST /updateAccount -------------------
router.post("/updateAccount", isLoggedIn, upload.single("profileFoto"), async function(req, res) {
  try {
    const db = req.app.locals.db;
    const users = db.collection("users");
    const userId = new ObjectId(req.session.user.id);

    const user = await users.findOne({ _id: userId });
    if (!user) return res.status(404).send("Gebruiker niet gevonden");

    const errors = [];

    // Formuliervelden sanitize
    const username = req.body["update-gebruikersnaam"] ? validator.escape(validator.trim(req.body["update-gebruikersnaam"])) : null;
    const email = req.body.email ? validator.trim(req.body.email) : null;
    const dob = req.body.dob;
    const huidigWachtwoord = req.body["huidig-wachtwoord"];
    const nieuwWachtwoord = req.body["nieuw-wachtwoord"];
    const bevestigWachtwoord = req.body["bevestig-wachtwoord"];

    // Aanvullende velden sanitize
    const jarenErvaringNum = Number(req.body.jarenErvaring);
    const specialisatie = [].concat(req.body.specialisatie || []).map(s => validator.escape(validator.trim(s)));
    const opmerkingen = validator.escape(validator.trim(req.body.aanvullendeOpmerkingen || ""));

    const jaartalVoertuigNum = Number(req.body.jaartalVoertuig);
    const merkVoertuig = validator.escape(validator.trim(req.body["merkVoertuig-api"] || ""));
    const voertuigModel = validator.escape(validator.trim(req.body["voertuig-api"] || ""));
    const pk = Number(req.body.pk) || null;
    const gewicht = Number(req.body.gewicht) || null;
    const aandrijving = validator.escape(validator.trim(req.body.aandrijving || ""));
    const mods = [].concat(req.body.mods || []);

    // Validatie
    if (isNaN(jarenErvaringNum) || jarenErvaringNum < 0 || jarenErvaringNum > 99) errors.push("Jaren ervaring moet een getal tussen 0 en 99 zijn.");
    if (isNaN(jaartalVoertuigNum) || jaartalVoertuigNum < 1950 || jaartalVoertuigNum > 2025) errors.push("Jaartal voertuig moet een geldig jaartal tussen 1950 en 2025 zijn.");
    if (dob && !validator.isDate(dob)) errors.push("Ongeldige geboortedatum");

    if (username) {
      const existingUser = await users.findOne({ username, _id: { $ne: userId } });
      if (existingUser) errors.push("Gebruikersnaam is al in gebruik");
    }

    if (email) {
      if (!validator.isEmail(email)) errors.push("Ongeldig email adres");
      const existingEmail = await users.findOne({ email, _id: { $ne: userId } });
      if (existingEmail) errors.push("Email is al geregistreerd");
    }

    if (errors.length) return res.status(400).send(errors.join("\n"));

    const huidigeVoertuig = user.voertuig || {};

    // Update object
    const updateData = {
      username: username || user.username,
      email: email || user.email,
      dob: dob || user.dob,
      jarenErvaring: jarenErvaringNum || user.jarenErvaring,
      specialisatie,
      opmerkingen,
      voertuig: {
        ...huidigeVoertuig,
        jaartal: jaartalVoertuigNum || huidigeVoertuig.jaartal,
        merk: merkVoertuig || huidigeVoertuig.merk,
        model: voertuigModel || huidigeVoertuig.model,
        pk: pk ?? huidigeVoertuig.pk,
        gewicht: gewicht ?? huidigeVoertuig.gewicht,
        aandrijving: aandrijving || huidigeVoertuig.aandrijving,
        mods,
        opmerkingen
      }
    };

    if (req.file) updateData.profielFoto = req.file.filename;

    if (nieuwWachtwoord) {
      if (!huidigWachtwoord) return res.status(400).send("Huidig wachtwoord is verplicht");
      const match = await bcrypt.compare(huidigWachtwoord, user.password);
      if (!match) return res.status(400).send("Huidig wachtwoord is onjuist");
      if (nieuwWachtwoord !== bevestigWachtwoord) return res.status(400).send("Wachtwoorden komen niet overeen");
      updateData.password = await bcrypt.hash(nieuwWachtwoord, 10);
    }

    await users.updateOne({ _id: userId }, { $set: updateData });
    req.session.user.username = updateData.username;

    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Fout bij updaten accountgegevens");
  }
});

module.exports = router;