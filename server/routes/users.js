const router = require("express").Router();
const User = require("../models/User");
const Movie = require("../models/Movie");
const Series = require("../models/Series");

const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");

// REGISTER
router.post("/register", async (req, res) => {
  try {
    // Encrypt the password using CryptoJS
    const encryptedPassword = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.SECRET_KEY
    ).toString();

    // Create a new user with the encrypted password
    const newUser = new User({
      email: req.body.email,
      password: encryptedPassword,
      isAdmin: req.body.isAdmin,
    });
    //console.log(newUser)

    // Save the user to the database
    const user = await newUser.save();

    // Create a JWT token for the user
    const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY);

    // Send the user information and token in the response
    res.status(201).json({ user, token });
  } catch (err) {
    console.error(err); // Log the error
    res.status(500).json(err);
  }
});

//GET
router.get("/find/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE
router.put("/:id", async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/:userId/add-movie/:movieId", async (req, res) => {
  const { userId, movieId } = req.params;

  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ error: "Movie not found" });
    }

    // Check if the movie is already in the watchedMovies array
    const isMovieInWatchedMovies = user.watchedMovies.some((item) =>
      item.movie.equals(movieId)
    );

    if (!isMovieInWatchedMovies) {
      // If the movie is not in watchedMovies, add it without progress
      user.watchedMovies.push({ movie: movieId, progress: 0 });
      await user.save();
      res.status(201).json({ message: "Movie added to watchedMovies" });
    } else {
      // If the movie is already in watchedMovies, return a message
      res.status(200).json({ message: "Movie is already in watchedMovies" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/:userId/edit-movie/:movieId", async (req, res) => {
  const { userId, movieId } = req.params;
  const { progress } = req.body;

  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the movie object in the watchedMovies array
    const movieIndex = user.watchedMovies.findIndex((item) =>
      item.movie.equals(movieId)
    );

    if (movieIndex === -1) {
      return res
        .status(404)
        .json({ error: "Movie not found in watchedMovies" });
    }

    // Update the progress value
    user.watchedMovies[movieIndex].progress = progress;
    await user.save();

    res.status(200).json({ message: "Progress updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:userId/add-series/:seriesId", async (req, res) => {
  const { userId, seriesId } = req.params;

  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if the series exists
    const series = await Series.findById(seriesId);
    if (!series) {
      return res.status(404).json({ error: "Series not found" });
    }

    // Check if the series is already in the watchedSeries array
    const isSeriesInWatchedSeries = user.watchedSeries.some((item) =>
      item.series.equals(seriesId)
    );

    if (!isSeriesInWatchedSeries) {
      // If the series is not in watchedSeries, add it with progress tracking
      const seriesToAdd = {
        series: seriesId,
        seasons: series.seasons.map((season) => ({
          seasonNumber: season.seasonNumber,
          episodes: season.episodes.map((episode) => ({
            episode: episode._id, // Assuming episode._id is the identifier for episodes
            progress: 0,
          })),
        })),
      };

      user.watchedSeries.push(seriesToAdd);
      await user.save();
      res.status(201).json({ message: "Series added to watchedSeries" });
    } else {
      // If the series is already in watchedSeries, return a message
      res.status(200).json({ message: "Series is already in watchedSeries" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put(
  "/:userId/edit-series-progress/:seriesId/:episodeId",
  async (req, res) => {
    const { userId, seriesId, episodeId } = req.params;
    const { progress } = req.body;

    try {
      // Check if the user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Find the series object in the watchedSeries array
      const seriesIndex = user.watchedSeries.findIndex((item) =>
        item.series.equals(seriesId)
      );

      if (seriesIndex === -1) {
        return res
          .status(404)
          .json({ error: "Series not found in watchedSeries" });
      }

      const series = user.watchedSeries[seriesIndex];

      // Update the progress for the specified episode in all seasons
      series.seasons.forEach((season) => {
        const episode = season.episodes.find((episode) =>
          episode.episode.equals(episodeId)
        );
        if (episode) {
          episode.progress = progress;
        }
      });

      await user.save();

      res
        .status(200)
        .json({
          message: "Progress updated successfully for the specified episode",
        });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// LOGIN
router.post("/login", async (req, res) => {
  try {
    // Find the user with the provided email in your database
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(401).json({ message: "Wrong email/username" });
    }

    // Decrypt and compare the stored password with the provided password
    const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

    if (originalPassword !== req.body.password) {
      return res.status(401).json({ message: "Wrong password/username" });
    }

    // If the credentials are valid, generate an access token
    const accessToken = jwt.sign(
      {
        id: user._id,
        isAdmin: user.isAdmin,
      },
      process.env.SECRET_KEY,
      {
        expiresIn: "24h", // Set the token expiration time
      }
    );

    // Send the user information (excluding the password) and the access token
    const { password, ...userInfo } = user._doc;
    res.status(200).json({ ...userInfo, accessToken });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
