const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const bcrypt = require("bcrypt");
const validator = require("validator");
const { isLoggedIn } = require("../middleware/authMiddleware");




router.get("/aanvullendeInformatie", isLoggedIn, (req, res) => {
  res.render("Pages/AanvullendeInformatie", { user: req.session.user });
});


router.get("/updateAccount", isLoggedIn, async (req, res) => {
  const db = req.app.locals.db;
  const users = db.collection("users");

  const user = await users.findOne({
    _id: new ObjectId(req.session.user.id)
  });

  res.render("Pages/updateAccount", { user });
});


router.post("/aanvullendeInformatie", isLoggedIn, async (req, res) => {
  try {
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


router.post("/updateAccount", isLoggedIn, async (req, res) => {
  const db = req.app.locals.db;
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

  // password update
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

  await users.updateOne(
    { _id: userId },
    { $set: updateData }
  );

  req.session.user.username = username;

  res.redirect("/");
});


module.exports = router;