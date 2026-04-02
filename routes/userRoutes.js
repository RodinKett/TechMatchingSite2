/**
 * User Account Router
 * -----------------------
 * Routes for managing user profile information and account settings.
 */

const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const { isLoggedIn } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");
const validate = require("../middleware/validate");

const { vehicleValidation, accountValidation } = require("../validators/userValidator");

router.get("/aanvullendeInformatie", function(req, res) {
  res.render("pages/aanvullendeInformatie", { 
    submitted: false  // Dit is de initiële pagina, geen submit geweest
  });
});


router.get("/updateAccount", function(req, res) {
  res.render("pages/updateAccount", { 
    submitted: false  // Dit is de initiële pagina, geen submit geweest
  });
});



// ------------------- POST /aanvullendeInformatie -------------------
router.post( "/aanvullendeInformatie", isLoggedIn, upload.single("profileFoto"), vehicleValidation, validate, async function(req, res) {
  try {

    const db = req.app.locals.db;
    const users = db.collection("users");
    const userId = new ObjectId(req.session.user.id);
    const user = await users.findOne({ _id: userId });
    const huidigeVoertuig = user?.voertuig || {};

    const updateData = {
      jarenErvaring: req.body.jarenErvaring,
      specialisatie: [].concat(req.body.specialisatie || []),
      opmerkingen: req.body.aanvullendeOpmerkingen || "",

      voertuig: {
        ...huidigeVoertuig,
        jaartal: req.body.jaartalVoertuig,
        merk: req.body["merkVoertuig-api"],
        model: req.body["voertuig-api"],
        pk: req.body.pk,
        gewicht: req.body.gewicht,
        aandrijving: req.body.aandrijving,
        mods: [].concat(req.body.mods || [])
      }
    };

    if (req.file) {
      updateData.profielFoto = req.file.filename;
    }

    await users.updateOne(
      { _id: userId },
      { $set: updateData }
    );

    res.redirect("/");

  } catch (error) {

    console.error(error);
    res.status(500).send("Fout bij opslaan aanvullende gegevens");

  }
});


// ------------------- POST /updateAccount -------------------
router.post( "/updateAccount", isLoggedIn, upload.single("profileFoto"), accountValidation, validate, async function(req, res) {
  try {

    const db = req.app.locals.db;
    const users = db.collection("users");
    const userId = new ObjectId(req.session.user.id);
    const user = await users.findOne({ _id: userId });

    if (!user) {
      return res.status(404).send("Gebruiker niet gevonden");
    }

    const username = req.body["update-gebruikersnaam"];
    const email = req.body.email;
    const dob = req.body.dob;

    const huidigWachtwoord = req.body["huidig-wachtwoord"];
    const nieuwWachtwoord = req.body["nieuw-wachtwoord"];
    const bevestigWachtwoord = req.body["bevestig-wachtwoord"];


    // Controle username uniek
    if (username && username !== user.username) {
      const existingUser = await users.findOne({
        username,
        _id: { $ne: userId }
      });

      if (existingUser) {
        return res.status(400).send("Gebruikersnaam is al in gebruik");
      }
    }

    // Controle email uniek
    if (email && email !== user.email) {
      const existingEmail = await users.findOne({
        email,
        _id: { $ne: userId }
      });

      if (existingEmail) {
        return res.status(400).send("Email is al geregistreerd");
      }
    }

    const updateData = {
      username: username || user.username,
      email: email || user.email,
      dob: dob || user.dob
    };

    // profielfoto
    if (req.file) {
      updateData.profielFoto = req.file.filename;
    }

    // wachtwoord wijziging
    if (nieuwWachtwoord) {
      if (!huidigWachtwoord) {
        return res.status(400).send("Huidig wachtwoord is verplicht");
      }

      const match = await bcrypt.compare(
        huidigWachtwoord,
        user.password
      );

      if (!match) {
        return res.status(400).send("Huidig wachtwoord is onjuist");
      }

      if (nieuwWachtwoord !== bevestigWachtwoord) {
        return res.status(400).send("Wachtwoorden komen niet overeen");
      }

      updateData.password = await bcrypt.hash(
        nieuwWachtwoord,
        10
      );
    }

    await users.updateOne(
      { _id: userId },
      { $set: updateData }
    );

    req.session.user.username = updateData.username;
    res.redirect("/");

  } catch (error) {
    console.error(error);
    res.status(500).send("Fout bij updaten accountgegevens");
  }

});


module.exports = router;