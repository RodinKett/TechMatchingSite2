const { body } = require("express-validator");

exports.registerValidation = [

  body("reg-gebruikersnaam")
    .trim()
    .escape()
    .isLength({ min: 3, max: 30 })
    .withMessage("Gebruikersnaam moet tussen 3 en 30 karakters zijn")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Alleen letters cijfers en _ toegestaan")
    .notEmpty()
    .withMessage("Gebruikersnaam is verplicht"),

  body("email")
    .isEmail()
    .withMessage("Ongeldig email adres")
    .normalizeEmail()
    .notEmpty()
    .withMessage("Email is verplicht"),
    

   body("reg-password")
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1
    })
    .withMessage("Wachtwoord moet minimaal 8 tekens bevatten, met een hoofdletter, kleine letter, cijfer en speciaal teken.")
    .notEmpty()
    .withMessage("Wachtwoord is verplicht"),

  body("dob")
    .isISO8601()
    .withMessage("Ongeldige geboortedatum")
    .notEmpty()
    .withMessage("Geboortedatum is verplicht"),

];

exports.loginValidation = [

  body("username")
    .trim()
    .notEmpty()
    .withMessage("Gebruikersnaam is verplicht"),

  body("password")
    .notEmpty()
    .withMessage("Wachtwoord is verplicht"),

];