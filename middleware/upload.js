/**
 * Upload Middleware
 * -----------------------
 * Dit bestand configureert de multer middleware voor het uploaden van bestanden.
 * Het wordt gebruikt voor het uploaden van profielfoto's of andere afbeeldingen.
 * 
 * Functionaliteit:
 * 1. Opslaglocatie: "static/uploads/"
 * 2. Bestandsnaam: Unieke naam gebaseerd op timestamp + random nummer + originele extensie
 * 3. File filter: Alleen afbeeldingen worden toegestaan (mime type start met "image/"),(Een MIME-type beschrijft het soort bestand dat wordt verstuurd of geüpload.)
 * 
 * Gebruik:
 * const upload = require("../middleware/upload");
 * router.post("/register", upload.single("profileFoto"), ...);
 */




const multer = require("multer");
const path = require("path");

// Configuratie van opslaglocatie en bestandsnaam
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Bestanden worden opgeslagen in "static/uploads/"
    cb(null, "static/uploads/");
  },
  filename: (req, file, cb) => {
    // Unieke bestandsnaam genereren: timestamp + random nummer + originele extensie
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

// Multer middleware configureren
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Alleen bestanden accepteren waarvan het mime type begint met "image/"
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Alleen afbeeldingen toegestaan"), false);
    }
  },
});

module.exports = upload;