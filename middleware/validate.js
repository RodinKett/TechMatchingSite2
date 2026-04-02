const { validationResult } = require("express-validator");

function validate(req, res, next) {
  // Alleen uitvoeren bij POST requests
  if (req.method !== 'POST') return next();

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render("pages/login", {
      validationErrors: errors.mapped(),  // Andere naam gebruiken
      old: req.body,
      activeStep: 1,
      submitted: true
    });
  }
  next();
}

module.exports = validate;