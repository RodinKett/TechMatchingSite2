const { body } = require("express-validator");

exports.accountValidation = [

  body("update-gebruikersnaam")
    .optional()
    .trim()
    .escape()
    .isLength({ min: 3, max: 30 })
    .withMessage("Gebruikersnaam moet tussen 3 en 30 karakters zijn")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Alleen letters cijfers en _ toegestaan"),

  body("email")
    .optional()
    .isEmail()
    .withMessage("Ongeldig email adres")
    .normalizeEmail(),

  body("dob")
    .optional()
    .isISO8601()
    .withMessage("Ongeldige geboortedatum"),

  body("nieuw-wachtwoord")
    .optional()
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    })
    .withMessage("Wachtwoord moet minimaal 8 tekens bevatten, met een hoofdletter, kleine letter, cijfer en speciaal teken."),

  body("aanvullendeOpmerkingen")
    .optional()
    .trim()
    .escape()

];

exports.vehicleValidation = [

  body("jarenErvaring")
    .isInt({ min: 0, max: 99 })
    .withMessage("Jaren ervaring moet tussen 0 en 99 zijn")
    .toInt(),

  body("jaartalVoertuig")
    .isInt({ min: 1950, max: new Date().getFullYear() })
    .withMessage("Ongeldig voertuig jaartal")
    .toInt(),

  body("merkVoertuig-api")
    .optional()
    .trim()
    .escape(),

  body("voertuig-api")
    .optional()
    .trim()
    .escape(),

  body("pk")
    .optional()
    .isInt({ min: 20, max: 2000 })
    .toInt(),

  body("gewicht")
    .optional()
    .isInt({ min: 500, max: 4000 })
    .toInt(),

  body("aandrijving")
    .optional()
    .trim()
    .escape(),

];