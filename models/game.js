const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  publisher: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  releaseDate: {
    type: Date,
    required: true,
  },
  typeOfGame: {
    type: String,
  },
  ageRestrictions: {
    type: Number,
  },
  tags: {
    type: String,
  },
  thumbnail: {
    type: Buffer,
    required: true,
  },
  thumbnailType: {
    type: String,
    required: true,
  },
});

gameSchema.virtual("imagePath").get(function () {
  if (this.thumbnail != null && this.thumbnailType != null) {
    return `data:${
      this.thumbnailType
    };charset=utf-8;base64,${this.thumbnail.toString("base64")}`;
  }
});

module.exports = mongoose.model("Game", gameSchema);
