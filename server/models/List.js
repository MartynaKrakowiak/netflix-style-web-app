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

const ContentSchema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    imgFeatured: { type: String },
    imgTitle: { type: String },
    imgThumbnail: { type: String },
    trailer: { type: String },
    video: { type: String },
    releaseDate: { type: String },
    ageLimit: { type: String },
    director: { type: String },
    cast: { type: [String] },
    genres: { type: [String] },
    tags: { type: [String] },
    seasons: [SeasonSchema],
  },
  { timestamps: true }
);

const ListSchema = new mongoose.Schema(
  {
    title: { type: String },
    genres: { type: [String], required: true },
    content: [ContentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("List", ListSchema);
