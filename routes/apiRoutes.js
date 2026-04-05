const express = require("express");
const router = express.Router();

const API_KEY = process.env.API_NINJAS_KEY;

// ------------------- Car Brands -------------------
router.get("/car-brands", async function (req, res) {
  try {

    const response = await fetch(
      "https://api.api-ninjas.com/v1/cars?make=toyota",
      {
        headers: {
          "X-Api-Key": process.env.API_NINJAS_KEY
        }
      }
    );

    const data = await response.json();

    if (!Array.isArray(data)) {
      console.error("API error:", data);
      return res.status(500).json({ error: "API Ninjas error." });
    }

    const merken = [
      { make_id: "toyota", make_display: "Toyota" },
      { make_id: "bmw", make_display: "BMW" },
      { make_id: "audi", make_display: "Audi" },
      { make_id: "ford", make_display: "Ford" },
      { make_id: "nissan", make_display: "Nissan" },
      { make_id: "honda", make_display: "Honda" }
    ];

    res.json(merken);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Het laden van merken is mislukt." });
  }
});


// ------------------- Car Models -------------------
router.get("/car-models/:make/:year", async function (req, res) {

  const make = req.params.make;
  const year = req.params.year;

  try {
    const response = await fetch(
      `https://api.api-ninjas.com/v1/cars?make=${make}&year=${year}`,
      { headers: { "X-Api-Key": API_KEY } }
    );

    const data = await response.json();

    const modellen = data.map(car => ({
      model_name: car.model
    }));

    res.json(modellen);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Modellen laden mislukt." });
  }
});


// ------------------- Car Specs -------------------
router.get("/car-specs/:make/:model/:year", async function (req, res) {

  const make = req.params.make;
  const model = req.params.model;
  const year = req.params.year;

  try {
    const response = await fetch(
      `https://api.api-ninjas.com/v1/cars?make=${make}&model=${model}&year=${year}`,
      { headers: { "X-Api-Key": API_KEY } }
    );

    const data = await response.json();

    const trims = data.map(car => ({
      model_engine_power_ps: car.horsepower,
      model_weight_kg: car.weight,
      model_drive: car.drive
    }));

    res.json(trims);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Specificaties laden mislukt." });
  }
});

module.exports = router;