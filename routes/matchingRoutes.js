const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const { isLoggedIn } = require("../middleware/authMiddleware");

// Matching pagina met filters
router.get("/matching", isLoggedIn, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const gebruikers = db.collection("users");

    const q = req.query;
    const meerdere = (val) => Array.isArray(val) ? val : [val];

    const query = {
      // Filter eigen profiel eruit als ingelogd
      ...(req.session.user && { _id: { $ne: new ObjectId(req.session.user.id) } }),
      ...(q.jaartal         && { "voertuig.jaartal":    q.jaartal }),
      ...(q.skillLevel      && { skillLevel:            { $in: meerdere(q.skillLevel) } }),
      ...(q.wielaandrijving && { "voertuig.aandrijving": { $in: meerdere(q.wielaandrijving) } }),
      ...(q.specialisatie   && { specialisatie:         { $in: meerdere(q.specialisatie) } }),
      ...(q.jarenErvaring   && { jarenErvaring:         q.jarenErvaring }),
      ...(q.mods            && { "voertuig.opmerkingen": { $in: meerdere(q.mods) } }),
      ...((q.pkVan || q.pkTot) && {
        "voertuig.pk": {
          ...(q.pkVan && { $gte: q.pkVan }),
          ...(q.pkTot && { $lte: q.pkTot }),
        },
      }),
    };

    const data = await gebruikers.find(query).toArray();

    const users = data.map(user => ({
      id:            user._id.toString(),
      profielFoto:   user.profielFoto           || "-",
      username:      user.username              || "Onbekend",
      merk:          user.voertuig?.merk        || "-",
      model:         user.voertuig?.model       || "-",
      jaartal:       user.voertuig?.jaartal     || "-",
      pk:            user.voertuig?.pk          || "-",
      aandrijving:   user.voertuig?.aandrijving || "-",
      mods:          user.voertuig?.opmerkingen || "-",
      specialisatie: user.specialisatie         || "-",
      jarenErvaring: user.jarenErvaring ? user.jarenErvaring + " jaar" : "-",
      skillLevel:    user.skillLevel            || "-",
      opmerkingen:   user.opmerkingen           || "Geen opmerkingen",
    }));

    res.render("pages/matching", { users });

  } catch (err) {
    console.error("Fout bij ophalen matching-profielen:", err);
    res.status(500).render("pages/500");
  }
});

module.exports = router;