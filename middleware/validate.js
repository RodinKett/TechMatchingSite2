const { validationResult } = require("express-validator");

function validate(req, res, next) {
  // Alleen uitvoeren bij POST requests
  if (req.method !== 'POST') return next();

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).render("pages/login", {
      errors: errors.mapped(),  // Dit is altijd een object
      old: req.body,
      submitted: true,
      activeStep: 1
    });
  }
  next();
}

module.exports = validate;