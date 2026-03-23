require("dotenv").config();

// zodat emilie bij de data base kan  (https://alexbevi.com/blog/2023/11/13/querysrv-errors-when-connecting-to-mongodb-atlas/)
require("node:dns/promises").setServers(["1.1.1.1", "8.8.8.8"]);

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

app.get("/matching", (req, res) => {
  res.render("Pages/matching");
});

app.get("/profiel", (req, res) => {
  res.render("Pages/profiel");
});


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