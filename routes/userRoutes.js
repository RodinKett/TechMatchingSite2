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
const upload = require("../middleware/upload");


// ------------------- GET ROUTES -------------------

// Render pagina voor aanvullende informatie
router.get("/aanvullendeInformatie", isLoggedIn, function(req, res) {
  res.render("pages/aanvullendeInformatie", { user: req.session.user });
});

// Render pagina om accountgegevens te updaten
router.get("/updateAccount", isLoggedIn, async function(req, res) {
  const db = req.app.locals.db;
  const users = db.collection("users");

  // Haal de huidige gebruiker op uit de database
  const user = await users.findOne({
    _id: new ObjectId(req.session.user.id)
  });

  res.render("pages/updateAccount", { user });
});

// ------------------- POST ROUTES -------------------

// Opslaan van aanvullende informatie van gebruiker
router.post("/aanvullendeInformatie", isLoggedIn, upload.single("profileFoto"), async function(req, res) {
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
// Update van accountgegevens, inclusief optioneel wachtwoord
router.post("/updateAccount", isLoggedIn, upload.single("profileFoto"), async function(req, res) {
  try {
    const db = req.app.locals.db;
    const users = db.collection("users");
    const userId = new ObjectId(req.session.user.id);

    // Haal huidige gebruiker op
    const user = await users.findOne({ _id: userId });
    if (!user) return res.status(404).send("Gebruiker niet gevonden");

    // Formuliervelden ophalen
    const username = req.body["update-gebruikersnaam"];
    const email = req.body.email;
    const phone = req.body["update-telefoonnummer"];
    const dob = req.body.dob;
    const gender = req.body["update-geslacht"];

    const huidigWachtwoord = req.body["huidig-wachtwoord"];
    const nieuwWachtwoord = req.body["nieuw-wachtwoord"];
    const bevestigWachtwoord = req.body["bevestig-wachtwoord"];

    // Aanvullende velden
    const skillLevel = req.body.skillLevel;
    const jarenErvaring = req.body.jarenErvaring;
    const specialisatie = req.body.specialisatie;

    const jaartalVoertuig = req.body.jaartalVoertuig;
    const merkVoertuig = req.body["merkVoertuig-api"];
    const voertuigModel = req.body["voertuig-api"];
    const pk = req.body.pk;
    const gewicht = req.body.gewicht;
    const aandrijving = req.body.aandrijving;
    const opmerkingen = req.body.aanvullendeOpmerkingen;

    // Validatie van input
    if (phone && !/^\+?[0-9]{7,15}$/.test(phone)) return res.status(400).send("Ongeldig telefoonnummer");
    if (dob && !validator.isDate(dob)) return res.status(400).send("Ongeldige geboortedatum");
    if (gender && !["man", "vrouw", "anders"].includes(gender)) return res.status(400).send("Ongeldig geslacht");

    // Controleer unieke username/email
    if (username) {
      const existingUser = await users.findOne({ username, _id: { $ne: userId } });
      if (existingUser) return res.status(400).send("Gebruikersnaam is al in gebruik");
    }

    if (email) {
      const existingEmail = await users.findOne({ email, _id: { $ne: userId } });
      if (existingEmail) return res.status(400).send("Email is al geregistreerd");
    }

    // Bouw updateData dynamisch, merge met bestaande data
    const updateData = {
      username: username || user.username,
      email: email || user.email,
      phone: phone || user.phone,
      dob: dob || user.dob,
      gender: gender || user.gender,
      skillLevel: skillLevel || user.skillLevel,
      jarenErvaring: jarenErvaring || user.jarenErvaring,
      specialisatie: specialisatie || user.specialisatie,
      voertuig: {
        ...user.voertuig,
        jaartal: jaartalVoertuig ?? user.voertuig?.jaartal,
        merk: merkVoertuig || user.voertuig?.merk,
        model: voertuigModel || user.voertuig?.model,
        pk: pk ?? user.voertuig?.pk,
        gewicht: gewicht ?? user.voertuig?.gewicht,
        aandrijving: aandrijving || user.voertuig?.aandrijving,
        opmerkingen: opmerkingen || user.voertuig?.opmerkingen,
      },
    };

    // Profielfoto verwerken als er een bestand is geüpload
    if (req.file) {
      updateData.profielFoto = req.file.filename;
    }

    // Wachtwoord wijzigen indien nodig
    if (nieuwWachtwoord) {
      if (!huidigWachtwoord) return res.status(400).send("Huidig wachtwoord is verplicht");
      const match = await bcrypt.compare(huidigWachtwoord, user.password);
      if (!match) return res.status(400).send("Huidig wachtwoord is onjuist");
      if (nieuwWachtwoord !== bevestigWachtwoord) return res.status(400).send("Wachtwoorden komen niet overeen");

      const hashedPassword = await bcrypt.hash(nieuwWachtwoord, 10);
      updateData.password = hashedPassword;
    }

    // Update in database
    await users.updateOne({ _id: userId }, { $set: updateData });

    // Update sessie
    req.session.user.username = updateData.username;

    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("Fout bij updaten accountgegevens");
  }
});

// Exporteer router
module.exports = router;