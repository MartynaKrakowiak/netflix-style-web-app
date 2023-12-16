const mongoose = require("mongoose");

const EpisodeSchema = new mongoose.Schema({
  title: { type: String },
  thumbnail: { type: String },
  video: { type: String },
  description: { type: String },
  episodeProgress: { type: Number },
});

const SeasonSchema = new mongoose.Schema({
  seasonNumber: { type: Number }, // Add a field to store the season number
  episodes: [EpisodeSchema], // Add a field to store episodes for this season
});

const SeriesSchema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    imgFeatured: { type: String },
    imgTitle: { type: String },
    imgThumbnail: { type: String },
    trailer: { type: String },
    releaseDate: { type: String },
    ageLimit: { type: String },
    director: { type: String },
    cast: { type: [String] },
    genres: { type: [String] },
    tags: { type: [String] },
    seasons: [SeasonSchema], // Add a field to store seasons containing episodes
  },
  { timestamps: true }
);

module.exports = mongoose.model("Series", SeriesSchema);