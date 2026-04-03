/**
 * Car API Router
 * -----------------------
 * Dit bestand definieert verschillende API-endpoints voor het ophalen van 
 * informatie over auto's via de CarQuery API. 
 * Het biedt de volgende functionaliteit:
 * 
 * 1. /car-brands
 *    - Haalt een lijst op van alle automerken.
 * 
 * 2. /car-models/:make/:year
 *    - Haalt een lijst op van modellen voor een bepaald merk en jaar.
 * 
 * 3. /car-specs/:make/:model/:year
 *    - Haalt de specificaties (trims) op van een specifiek model en jaar.
 * 
 * De router verwerkt de API-responses en retourneert de gegevens als JSON.
 * Bij fouten wordt een statuscode 500 teruggegeven met een foutmelding.
 */




// Importeer de express-module
const express = require("express");

// Maak een nieuwe router aan
const router = express.Router();

// Endpoint om een lijst van automerken op te halen
router.get("/car-brands", async function(req, res) {
  try {

    const response = await fetch("http://www.carqueryapi.com/api/0.3/?cmd=getMakes");

    const text = await response.text();
    console.log(text.slice(0,200));

    const json = text.replace(/^var data = /, "").replace(/;$/, "");
    const data = JSON.parse(json);

    res.json(data.Makes);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Het laden van merken is mislukt." });
  }
});

// Endpoint om modellen van een bepaald merk en jaar op te halen
router.get("/car-models/:make/:year", async function(req, res) {
  const make = req.params.make; // merk uit de URL
  const year = req.params.year; // jaar uit de URL

  try {
    // Haal de modellen op van de API voor het opgegeven merk en jaar
    const response = await fetch(
      `https://www.carqueryapi.com/api/0.3/?cmd=getModels&make=${make}&year=${year}`
    );

    const text = await response.text();
    const data = JSON.parse(text.replace("var data = ", "").replace(";", ""));

    // Stuur de lijst van modellen terug als JSON
    res.json(data.Models);
  } catch (err) {
    // Foutafhandeling
    res.status(500).json({ error: "Modellen laden mislukt." });
  }
});

// Endpoint om specificaties van een specifiek model op te halen
router.get("/car-specs/:make/:model/:year", async function(req, res) {
  const make = req.params.make;   // merk uit de URL
  const model = req.params.model; // model uit de URL
  const year = req.params.year;   // jaar uit de URL

  try {
    // Haal de trims/specificaties op van de API
    const response = await fetch(
      `https://www.carqueryapi.com/api/0.3/?cmd=getTrims&make=${make}&model=${model}&year=${year}`
    );

    const text = await response.text();
    const data = JSON.parse(text.replace("var data = ", "").replace(";", ""));

    // Stuur de specificaties terug als JSON
    res.json(data.Trims);
  } catch (err) {
    // Foutafhandeling
    res.status(500).json({ error: "Specificaties laden mislukt" });
  }
});

// Exporteer de router zodat deze gebruikt kan worden in app.js
module.exports = router;