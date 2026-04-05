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


// Aanpassing Start hier
// BRONVERMELDING: Voor de missende data en hulp met fouten corrigeren: CHATGPT, co-pilot
// Dat includes de username, spelers sort a en b en de math.floor, jij als speler de req.session
app.get("/leaderbord", async (req, res) => {
  try {
    const db = client.db("StreetracerApp");
    const gebruikers = db.collection("users");

    const data = await gebruikers.find().toArray();

    const bepaalRang = (punten) => {
      if (punten >= 5000) return "Expert";
      if (punten >= 1000) return "Ervaren";
      if (punten >= 100) return "Bevorderd"
      return "Beginner"
    };

    // Maak een nieuw array 'spelers' met alle benodigde info
    // Random wins, losses en ties genereren
    const spelers = data.map(user => {
      const wins = Math.floor(Math.random() *90);
      const loss = Math.floor(Math.random() *30);
      const ties = Math.floor(Math.random() *50);

      // Bereken totaal aantal games en punten
      const totaalGames = wins + loss + ties;
      const punten = wins * 3 + ties * 1 - loss * 2;
      const winstpercentage = totaalGames > 0 ? wins / totaalGames : 0;

      // Return een object met alle info die je in de EJS template nodig hebt
      return{
        id: user._id.toString(),
        naam: user.username || "onbekend",
        gewonnen: wins,
        verloren: loss,
        gelijk: ties,
        punten,
        winstpercentage,
        rang: bepaalRang(punten)
      };
    });

    // Sorteer de spelers op punten, verlies en winstpercentage, dan naam
    spelers.sort((a, b) => {
      if (b.punten !== a.punten) return b.punten - a.punten; // Hoogste punten eers
      if (a.verloren !== b.verloren) return a.verloren - b.verloren; // Bij gelijk punten minst verloren eerst
      if (b.winstpercentage !== a.winstpercentage) return b.winstpercentage - a.winstpercentage; // Bij gelijk punten & verlies: hoogste winrate eerst
      return a.naam.localeCompare(b.naam); //Bij alles gelijk: alfabetisch
    });

    spelers.forEach((speler, index) => {
      speler.rank = index + 1;
    });

    // Vind de huidige ingelogde gebruiker (indien ingelogd)
    let jij = null;

    if (req.session.user) {
      jij = spelers.find(s => s.id === req.session.user.id?.toString());
    }

    res.render("pages/leaderbord", {
      spelers,
      jij
    });

  } catch (error) {
    console.error(error);
    res.status(500).send("Er is iets fout gegaan bij het ophalen van het leaderbord");
  }
});

// Eind aanpassing


app.get("/loadingpage", (req, res) => {
  res.render("pages/loadingpage");
});


// ------------------- Error handeling ------------------
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