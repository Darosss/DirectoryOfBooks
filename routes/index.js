const express = require("express");
const router = express.Router();
const Book = require("../models/book");
const Game = require("../models/game");

router.get("/", async (req, res) => {
  let books;
  let games;
  try {
    books = await Book.find({}).sort({ createdAt: "desc" }).limit(7).exec();
    games = await Game.find({}).sort({ createdAt: "desc" }).limit(7).exec();
  } catch {
    books = [];
    games = [];
  }
  res.render("index", { books: books, games: games });
});

module.exports = router;
