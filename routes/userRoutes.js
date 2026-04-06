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

router.get("/updateAccount", isLoggedIn, async function(req, res) {
  try {
    const db = req.app.locals.db;
    const users = db.collection("users");
    const user = await users.findOne({ _id: new ObjectId(req.session.user.id) });

    if (!user) return res.status(404).send("Gebruiker niet gevonden");

    res.render("pages/updateAccount", { user }); // pass user to template
  } catch (error) {
    console.error(error);
    console.log("error met ophalen van de user")
    res.status(500).render("pages/500");
  }
});


// ------------------- POST /aanvullendeInformatie -------------------
router.post("/aanvullendeInformatie", isLoggedIn, upload.single("profielFoto"), async function(req, res) {
  try {
    // --------------------------
    // Sanitize & parse input
    // --------------------------
    const jarenErvaring = Number(req.body.jarenErvaring);
    const specialisatie = ([]).concat(req.body.specialisatie || []).map(s => validator.escape(validator.trim(s)));
    const opmerkingen = validator.escape(validator.trim(req.body.aanvullendeOpmerkingen || ""));

    const jaartalVoertuig = Number(req.body.jaartalVoertuig);
    const merkVoertuig = validator.escape(validator.trim(req.body["merkVoertuig-api"] || ""));
    const voertuigModel = validator.escape(validator.trim(req.body["voertuig-api"] || ""));
    const pk = Number(req.body.pk) || null;
    const gewicht = Number(req.body.gewicht) || null;
    const aandrijving = validator.escape(validator.trim(req.body.aandrijving || ""));
    const mods = [].concat(req.body.mods || []);

    // --------------------------
    // Validation
    // --------------------------
    const errors = {};
    const opmerkingenRegex = /^[\w\s.,!?()@-]{0,500}$/; // same as original

    if (isNaN(jarenErvaring) || jarenErvaring < 0 || jarenErvaring > 99) {
      errors.jarenErvaring = "Voer een geldig aantal jaren ervaring in (0-99).";
    }

    if (!specialisatie.length || specialisatie.includes("Geen")) {
      errors.specialisatie = "Selecteer minimaal één specialisatie.";
    }

    if (!opmerkingenRegex.test(opmerkingen)) {
      errors.aanvullendeOpmerkingen = "Max 500 tekens, letters, cijfers en basis leestekens.";
    }

    if (isNaN(jaartalVoertuig) || jaartalVoertuig < 1950 || jaartalVoertuig > 2025) {
      errors.jaartalVoertuig = "Voer een geldig jaartal voertuig in (1950-2025).";
    }

    if (!merkVoertuig || merkVoertuig === "-") {
      errors.merkVoertuig = "Selecteer een merk.";
    }

    if (!voertuigModel || voertuigModel === "-") {
      errors.voertuigModel = "Selecteer een model.";
    }

    if (!mods.length || mods.includes("Geen")) {
      errors.mods = "Selecteer minimaal één mod.";
    }

    if (req.file) {
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(req.file.mimetype)) {
        errors.profielFoto = "Alleen JPG, PNG of WEBP toegestaan voor profielfoto.";
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // --------------------------
    // Update DB
    // --------------------------
    const db = req.app.locals.db;
    const users = db.collection("users");
    const userId = new ObjectId(req.session.user.id);

    const huidigeVoertuig = (await users.findOne({ _id: userId })).voertuig || {};

    const updateData = {
      jarenErvaring,
      specialisatie,
      opmerkingen,
      voertuig: {
        ...huidigeVoertuig,
        jaartal: jaartalVoertuig,
        merk: merkVoertuig,
        model: voertuigModel,
        pk,
        gewicht,
        aandrijving,
        mods,
      }
    };

    if (req.file) updateData.profielFoto = req.file.filename;

    await users.updateOne({ _id: userId }, { $set: updateData });

    res.json({ success: true, redirect: "/loadingpage?next=/" });
  } catch (err) {
    console.error(err);
    console.log("Error met het toevoegen van aanvullende gegevens")
    res.status(500).render("pages/500");
  }
});

// ------------------- POST /updateAccount -------------------
router.post("/updateAccount", isLoggedIn, upload.single("profielFoto"), async function(req, res) {
  try {
    const db = req.app.locals.db;
    const users = db.collection("users");
    const userId = new ObjectId(req.session.user.id);

    const user = await users.findOne({ _id: userId });
    if (!user) return res.status(404).send({ general: "Gebruiker niet gevonden" });

    // ================================
    // Sanitize input
    // ================================
    const email = req.body.email ? validator.trim(req.body.email) : "";
    const dob = req.body.dob || "";
    const huidigWachtwoord = req.body["huidig-wachtwoord"];
    const nieuwWachtwoord = req.body["nieuw-wachtwoord"];
    const bevestigWachtwoord = req.body["bevestig-wachtwoord"];

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

    // ================================
    // Validation
    // ================================
    const errors = {};

    if (email && !validator.isEmail(email)) errors.email = "Ongeldig email adres";
    if (email) {
      const existingEmail = await users.findOne({ email, _id: { $ne: userId } });
      if (existingEmail) errors.email = "Email is al geregistreerd";
    }

    if (huidigWachtwoord && !await bcrypt.compare(huidigWachtwoord, user.password)) {
      errors.huidigWachtwoord = "Huidig wachtwoord is onjuist";
    }

    if (nieuwWachtwoord) {
      if (!huidigWachtwoord) errors.huidigWachtwoord = "Huidig wachtwoord is verplicht";
      if (nieuwWachtwoord !== bevestigWachtwoord) errors.bevestigWachtwoord = "Wachtwoorden komen niet overeen";
      if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@#$%^&+=]{8,}$/.test(nieuwWachtwoord)) {
        errors.nieuwWachtwoord = "Wachtwoord minimaal 8 tekens met hoofdletter, kleine letter en cijfer";
      }
    }

    if (isNaN(jarenErvaringNum) || jarenErvaringNum < 0 || jarenErvaringNum > 99) {
      errors.jarenErvaring = "Jaren ervaring moet tussen 0 en 99 zijn";
    }

    if (!specialisatie.length) errors.specialisatie = "Selecteer minimaal één specialisatie";

    if (!opmerkingen || opmerkingen.length > 500) errors.aanvullendeOpmerkingen = "Max 500 tekens";

    if (isNaN(jaartalVoertuigNum) || jaartalVoertuigNum < 1950 || jaartalVoertuigNum > 2025) {
      errors.jaartalVoertuig = "Jaartal voertuig moet tussen 1950 en 2025 zijn";
    }

    if (!merkVoertuig) errors.merkVoertuig = "Selecteer een merk";
    if (!voertuigModel) errors.voertuigModel = "Selecteer een model";
    if (!mods.length) errors.mods = "Selecteer minimaal één mod";

    if (req.file) {
      const allowed = ["image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(req.file.mimetype)) {
        errors.profielFoto = "Alleen JPG, PNG of WEBP toegestaan";
      }
    }

    // Return errors if any
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ errors });
    }

    // ================================
    // Update user
    // ================================
    const huidigeVoertuig = user.voertuig || {};
    const updateData = {
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
      }
    };

    if (req.file) updateData.profielFoto = req.file.filename;

    if (nieuwWachtwoord) {
      updateData.password = await bcrypt.hash(nieuwWachtwoord, 10);
    }

    await users.updateOne({ _id: userId }, { $set: updateData });

    res.json({ success: true, redirect: "/loadingpage?next=/" });
  } catch (error) {
    console.error(error);
    console.log("Error met updaten van account")
    res.status(500).render("pages/500");
  }
});

module.exports = router;