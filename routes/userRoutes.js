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
const { ObjectId } = require("mongodb"); // Voor MongoDB ObjectId
const bcrypt = require("bcrypt"); // Voor wachtwoord hashing
const validator = require("validator"); // Voor validatie en ontsmetten van input
const { isLoggedIn } = require("../middleware/authMiddleware"); // Middleware voor authenticatie

// ------------------- GET ROUTES -------------------

// Render pagina voor aanvullende informatie
router.get("/aanvullendeInformatie", isLoggedIn, function(req, res) {
  res.render("Pages/AanvullendeInformatie", { user: req.session.user });
});

// Render pagina om accountgegevens te updaten
router.get("/updateAccount", isLoggedIn, async function(req, res) {
  const db = req.app.locals.db;
  const users = db.collection("users");

  // Haal de huidige gebruiker op uit de database
  const user = await users.findOne({
    _id: new ObjectId(req.session.user.id)
  });

  res.render("Pages/updateAccount", { user });
});

// ------------------- POST ROUTES -------------------

// Opslaan van aanvullende informatie van gebruiker
router.post("/aanvullendeInformatie", isLoggedIn, async function(req, res) {
  try {
    const errors = [];

    // Haal formuliergegevens op
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

    // Validatie van input
    if (!["beginer", "bekend", "expert"].includes(skillLevel)) {
      errors.push("Ongeldig skill level.");
    }

    if (!/^[0-9]{1,2}$/.test(jarenErvaring)) {
      errors.push("Jaren ervaring moet 0-99 zijn.");
    }

    if (!/^[0-9]{4}$/.test(jaartalVoertuig)) {
      errors.push("Jaartal voertuig moet 4 cijfers zijn.");
    }

    if (errors.length > 0) {
      return res.status(400).send(errors.join("\n"));
    }

    const db = req.app.locals.db;
    const users = db.collection("users");
    const userId = new ObjectId(req.session.user.id);

    // Update gebruiker met aanvullende informatie
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
            pk,
            gewicht,
            aandrijving,
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

// Update van accountgegevens, inclusief optioneel wachtwoord
router.post("/updateAccount", isLoggedIn, async function(req, res) {
  const db = req.app.locals.db;
  const users = db.collection("users");
  const userId = new ObjectId(req.session.user.id);

  const user = await users.findOne({ _id: userId });

  // Haal formuliervelden op
  const username = req.body["update-gebruikersnaam"];
  const email = req.body.email;
  const phone = req.body["update-telefoonnummer"];
  const dob = req.body.dob;
  const gender = req.body["update-geslacht"];

  const huidigWachtwoord = req.body["huidig-wachtwoord"];
  const nieuwWachtwoord = req.body["nieuw-wachtwoord"];
  const bevestigWachtwoord = req.body["bevestig-wachtwoord"];

  // Controleer of gebruikersnaam of email al in gebruik is door anderen
  const existingUser = await users.findOne({ username, _id: { $ne: userId } });
  if (existingUser) return res.status(400).send("Gebruikersnaam is al in gebruik");

  const existingEmail = await users.findOne({ email, _id: { $ne: userId } });
  if (existingEmail) return res.status(400).send("Email is al geregistreerd");

  // Validatie telefoonnummer
  if (!/^\+?[0-9]{7,15}$/.test(phone)) {
    return res.status(400).send("Ongeldig telefoonnummer");
  }

  // Validatie geboortedatum
  if (!validator.isDate(dob)) {
    return res.status(400).send("Ongeldige geboortedatum");
  }

  // Validatie geslacht
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

  // Als wachtwoord wordt gewijzigd
  if (nieuwWachtwoord) {
    const match = await bcrypt.compare(huidigWachtwoord, user.password);

    if (!match) {
      return res.status(400).send("Huidig wachtwoord is onjuist");
    }

    if (nieuwWachtwoord !== bevestigWachtwoord) {
      return res.status(400).send("Wachtwoorden komen niet overeen");
    }

    const hashedPassword = await bcrypt.hash(nieuwWachtwoord, 10);
    updateData.password = hashedPassword;
  }

  // Update gebruiker in de database
  await users.updateOne(
    { _id: userId },
    { $set: updateData }
  );

  // Update sessie met nieuwe gebruikersnaam
  req.session.user.username = username;

  res.redirect("/");
});

// Exporteer router
module.exports = router;