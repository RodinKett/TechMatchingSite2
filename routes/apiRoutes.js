const express = require("express");
const router = express.Router();

router.get("/car-brands", async (req, res) => {
  try {
    const response = await fetch("https://www.carqueryapi.com/api/0.3/?cmd=getMakes");
    const text = await response.text();
    const data = JSON.parse(text.replace("var data = ", "").replace(";", ""));

    res.json(data.Makes);
  } catch (err) {
    res.status(500).json({ error: "Het laden van merken is mislukt." });
  }
});

router.get("/car-models/:make/:year", async (req, res) => {
  const { make, year } = req.params;

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

router.get("/car-specs/:make/:model/:year", async (req, res) => {
  const { make, model, year } = req.params;

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