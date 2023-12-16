const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: { type: String },
  password: { type: String},
  isAdmin: {type: Boolean},
  favoriteMovies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Movie' }],
    watchedMovies: [
    {
      movie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
      },
      progress: {
        type: Number,
        default: 0, // You can set a default value if needed
      },
    },
  ],
  watchedSeries: [
    {
      series: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Series',
      },
      seasons: [
        {
          seasonNumber: {
            type: Number,
          },
          episodes: [
            {
              episode: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Episode',
              },
              progress: {
                type: Number,
                default: 0,
              },
            },
          ],
        },
      ],
    },
  ],
});


module.exports = mongoose.model("User", UserSchema);