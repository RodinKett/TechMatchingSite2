/**
 * Hoofdserverbestand (app.js)
 * -----------------------
 * Dit bestand start de Express-server, configureert middleware, routes en 
 * verbindt met de MongoDB-database.
 * 
 * Functionaliteit:
 * 1. Laadt environment variables via dotenv.
 * 2. Verbindt met MongoDB en maakt de database beschikbaar via app.locals.db.
 * 3. Configureert Express:
 *    - Statische bestanden in "static" map
 *    - EJS als view engine
 *    - JSON- en URL-encoded body parsing
 *    - Sessiebeheer met express-session
 * 4. Importeert en gebruikt routes:
 *    - /api -> apiRoutes
 *    - / -> authRoutes & userRoutes
 * 5. Definieert basisroutes:
 *    - / -> indexpagina
 *    - /loadingpage -> loadingpagina
 * 6. Start de server op poort 3000
 */

/////connectie met data/////
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);


require("dotenv").config(); // Load environment variables

const path = require("path");
const { MongoClient } = require("mongodb");
const express = require("express");
const session = require("express-session");

// Routes importeren
const apiRoutes = require("./routes/apiRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const port = 3000;

// MongoDB connectie instellen
const uri = process.env.URI;
const client = new MongoClient(uri);

// ------------------- Middleware -------------------
// Statische bestanden serveren vanuit de "static" map
app.use(express.static(path.join(__dirname, "static")));

// EJS als view engine instellen
app.set("view engine", "ejs");

// Body parsing middleware       
// Body parsing middleware leest en converteert de request body (bijv. JSON of form-data) naar een bruikbaar object voor de server.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessies configureren
app.use(
  session({
    secret: process.env.SESSION_SECRET, // secret voor sessie
    resave: false, // sessie niet opnieuw opslaan als deze niet veranderd is
    saveUninitialized: false, // niet opslaan van lege sessies
  }),
);

// ------------------- Routes -------------------
// API routes
app.use("/api", apiRoutes);

// Auth routes (login, register, logout)
app.use("/", authRoutes);

// User routes (aanvullende info, update account)
app.use("/", userRoutes);

// Basis routes
app.get("/", (req, res) => {
  res.render("pages/index");
});

app.get("/berichtenlijst", (req, res) => {
   const verzoekAantal = 2; 

  res.render("pages/berichtenlijst", {
    verzoekAantal: verzoekAantal
  });
});

app.get("/bericht", (req, res) => {
  res.render("pages/bericht");
});

app.get("/verzoeken", (req, res) => {
  res.render("pages/verzoeken");
});


// ------------------- Feedback handeling ------------------
app.get("/loadingpage", (req, res) => {
  res.render("pages/loadingpage");
});

app.use((req, res) => {
  res.status(404).render("pages/404");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render("pages/500");
});


// ------------------- Server starten -------------------
async function startServer() {
  try {
    // Verbinden met MongoDB
    await client.connect();
    app.locals.db = client.db("StreetracerApp"); // database beschikbaar maken in routes

    console.log("Connected to MongoDB");

    // Server starten
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}

// Start de server
startServer();