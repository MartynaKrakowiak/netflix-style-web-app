const mongoose = require("mongoose");

const MovieSchema = new mongoose.Schema(
  {
    title: { type: String},
    description: { type: String},
    imgFeatured: { type: String},
    imgTitle: { type: String},
    imgThumbnail: { type: String},
    trailer: { type: String},
    video: { type: String},
    releaseDate: { type: String},
    ageLimit: { type: String},
    director: { type: String},
    cast:  { type: [String]},
    genres: { type: [String]},
    tags:  { type: [String]},
    progress: {type: Number},
  },
  { timestamps: true }
);

module.exports = mongoose.model("Movie", MovieSchema);