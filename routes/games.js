const express = require("express");
const router = express.Router();
const Game = require("../models/game");
const imageMimeTypes = ["image/jpeg", "image/png", "image/gifs"];
router.get("/", (req, res) => {
  res.render("games/index");
});
router.get("/new", (req, res) => {
  renderNewPage(res, new Game());
});

router.post("/", async (req, res) => {
  const fileName = req.file != null ? req.file.filename : null;
  const game = new Game({
    title: req.body.title,
    publisher: req.body.publisher,
    releaseDate: new Date(req.body.releaseDate),
    tags: req.body.tags,
    thumbnail: fileName,
    description: req.body.description,
  });
  try {
    saveThumbnail(game, req.body.thumbnail);
    const newGame = await game.save();
    res.redirect(`games/${newGame.id}`);
  } catch (error) {
    console.log(error);
    renderNewPage(res, game, true);
  }
});
router.get("/:id", async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    res.render("games/show", { game: game });
  } catch {
    res.redirect("/");
  }
});
router.get("/:id/edit", async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    renderEditPage(res, game);
  } catch (error) {
    res.redirect("/");
  }
});
async function renderNewPage(res, game, hasError = false) {
  renderFormPage(res, game, "new", hasError);
}
async function renderEditPage(res, game, hasError = false) {
  renderFormPage(res, game, "edit", hasError);
}
async function renderFormPage(res, game, form, hasError = false) {
  try {
    const params = { game: game };
    if (hasError) {
      if (form === "edit") {
        params.errorMessage = "Error updating game";
      } else {
        params.errorMessage = "Error creating game";
      }
    }
    res.render(`games/${form}`, params);
  } catch (error) {
    res.redirect("/games");
  }
}

function saveThumbnail(game, thumbnailEncoded) {
  if (!thumbnailEncoded) return;
  const img = JSON.parse(thumbnailEncoded);
  if (img != null && imageMimeTypes.includes(img.type)) {
    game.thumbnail = new Buffer.from(img.data, "base64");
    game.thumbnailType = img.type;
  }
}

module.exports = router;
