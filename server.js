require("dotenv").config();

const path = require("path");
const { MongoClient} = require("mongodb");
const express = require("express");
const session = require("express-session");

const apiRoutes = require("./routes/apiRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const port = 3000;

const uri = process.env.URI;
const client = new MongoClient(uri);


app.use(express.static(path.join(__dirname, "static")));
app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);


app.use("/api", apiRoutes);
app.use("/", authRoutes);
app.use("/", userRoutes);


app.get("/", (req, res) => {
  res.render("Pages/index");
});

app.get("/loadingpage", (req, res) => {
  res.render("Pages/loadingpage");
});


async function startServer() {
  try {
    await client.connect();
    app.locals.db = client.db("StreetracerApp");

    console.log("Connected to MongoDB");

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
  }
}

startServer();
