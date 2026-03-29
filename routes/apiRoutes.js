const express = require("express");
const router = express.Router();

// GET car brands
router.get("/car-brands", async function(req, res) {
  try {
    const response = await fetch("https://www.carqueryapi.com/api/0.3/?cmd=getMakes");
    const text = await response.text();
    const data = JSON.parse(text.replace("var data = ", "").replace(";", ""));

    res.json(data.Makes);
  } catch (err) {
    res.status(500).json({ error: "Het laden van merken is mislukt." });
  }
});

// GET car models for a specific make and year
router.get("/car-models/:make/:year", async function(req, res) {
  const make = req.params.make;
  const year = req.params.year;

  try {
    const response = await fetch(
      `https://www.carqueryapi.com/api/0.3/?cmd=getModels&make=${make}&year=${year}`
    );

    const text = await response.text();
    const data = JSON.parse(text.replace("var data = ", "").replace(";", ""));

    res.json(data.Models);
  } catch (err) {
    res.status(500).json({ error: "Modellen laden mislukt." });
  }
});

// GET car specs for a specific make, model, and year
router.get("/car-specs/:make/:model/:year", async function(req, res) {
  const make = req.params.make;
  const model = req.params.model;
  const year = req.params.year;

  try {
    const response = await fetch(
      `https://www.carqueryapi.com/api/0.3/?cmd=getTrims&make=${make}&model=${model}&year=${year}`
    );

    const text = await response.text();
    const data = JSON.parse(text.replace("var data = ", "").replace(";", ""));

    res.json(data.Trims);
  } catch (err) {
    res.status(500).json({ error: "Specificaties laden mislukt" });
  }
});

module.exports = router;