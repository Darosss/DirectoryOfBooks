const express = require("express");
const router = express.Router();
const Game = require("../models/game");
const imageMimeTypes = ["image/jpeg", "image/png", "image/gifs"];

//All games + search
router.get("/", async (req, res) => {
  let query = Game.find();
  if (req.query.title != null && req.query.title != "") {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }
  if (req.query.releasedBefore != null && req.query.releasedBefore != "") {
    query = query.lte("releaseDate", req.query.releasedBefore);
  }
  if (req.query.releasedAfter != null && req.query.releasedAfter != "") {
    query = query.gte("releaseDate", req.query.releasedAfter);
  }
  if (req.query.publisher != null && req.query.publisher != "") {
    query = query.regex("publisher", new RegExp(req.query.publisher, "i"));
  }
  if (req.query.typeOfGame != null && req.query.typeOfGame != "") {
    query = query.regex("typeOfGame", new RegExp(req.query.typeOfGame, "i"));
  }
  if (req.query.ageRestrictions != null && req.query.ageRestrictions != "") {
    query = query.gte("ageRestrictions", req.query.ageRestrictions);
  }
  //TODO create better organization in conditions
  try {
    const games = await query.exec();
    res.render("games/index", {
      games: games,
      searchOptions: req.query,
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});
//New game
router.get("/new", (req, res) => {
  renderNewPage(res, new Game());
});

//Post new game
router.post("/", async (req, res) => {
  const fileName = req.file != null ? req.file.filename : null;
  const game = new Game({
    title: req.body.title,
    publisher: req.body.publisher,
    releaseDate: new Date(req.body.releaseDate),
    ageRestrictions: req.body.ageRestrictions,
    typeOfGame: req.body.typeOfGame,
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
//Get game with id
router.get("/:id", async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    res.render("games/show", { game: game });
  } catch {
    res.redirect("/");
  }
});
//Edit route  with id
router.get("/:id/edit", async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    renderEditPage(res, game);
  } catch (error) {
    res.redirect("/");
  }
});
//Update game with id
router.put("/:id", async (req, res) => {
  let game;
  try {
    game = await Game.findById(req.params.id);
    game.title = req.body.title;
    game.publisher = req.body.publisher;
    game.releaseDate = new Date(req.body.releaseDate);
    game.ageRestrictions = req.body.ageRestrictions;
    game.typeOfGame = req.body.typeOfGame;
    game.tags = req.body.tags;
    game.description = req.body.description;
    if (req.body.thumbnail != null && req.body.thumbnail !== "") {
      saveCover(game, req.body.thumbnail);
    }
    await game.save();
    res.redirect(`/games/${game.id}`);
  } catch (err) {
    console.log(err);
    if (game != null) {
      renderEditPage(res, game, true);
    } else {
      res.redirect("/");
    }
  }
});
//Delete game
router.delete("/:id", async (req, res) => {
  let game;
  try {
    game = await Game.findById(req.params.id);
    await game.remove();
    res.redirect("/games");
  } catch (error) {
    console.log(error);
    if (game != null) {
      res.render("games/show", {
        game: game,
        errorMessage: "Could not remove game",
      });
    } else {
      res.redirect("/games");
    }
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
function saveCover(game, imgEncoded) {
  if (!imgEncoded) return;
  const img = JSON.parse(imgEncoded);
  if (img != null && imageMimeTypes.includes(img.type)) {
    game.thumbnail = new Buffer.from(img.data, "base64");
    game.thumbnailType = img.type;
  }
}
module.exports = router;
