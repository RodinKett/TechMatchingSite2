require("dotenv").config();

const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");
const session = require("express-session");

const app = express();
const port = 3000;

const uri = process.env.URI;
const client = new MongoClient(uri);

app.set("view engine", "ejs");

app.use(express.static(path.join(__dirname, "Public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

/////////////////////////////////////////////////////////////////////////

app.use(express.static(path.join(__dirname, "static")));

app.get("/", (req, res) => {
  res.render("Pages/index");
});

// Aanpassing

app.get("/leaderbord", (req, res) => {
  const spelers = [
    { naam: "Willem", gewonnen: 10, verloren: 2},
    { naam: "Suzan", gewonnen: 8, verloren: 5},
    { naam: "Mia", gewonnen: 6, verloren: 3},
    { naam: "Phillip", gewonnen: 3, verloren: 1},
    { naam: "Klaas", gewonnen: 3, verloren: 4},
    { naam: "Jan", gewonnen: 3, verloren: 7},
    { naam: "Lis", gewonnen: 3, verloren: 9}
  ];

  const jij = spelers[0];  
  
  res.render("Pages/leaderbord", {
    spelers: spelers,
    jij: jij
  });
});
// Eind aanpassing

async function startServer() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });

  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}

startServer();