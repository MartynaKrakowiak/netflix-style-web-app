const router = require("express").Router();
const Series = require("../models/Series");
const { ObjectId } = require("mongodb");
const verifyToken = require("../verifyToken");

//CREATE
router.post("/", verifyToken, async (req, res) => {
  const newSeries = new Series(req.body);
  try {
    const savedSeries = await newSeries.save();
    res.status(201).json(savedSeries);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const updatedSeries = await Series.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).json(updatedSeries);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET
router.get("/find/:id", async (req, res) => {
  try {
    const series = await Series.findById(req.params.id);
    res.status(200).json(series);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET RANDOM
router.get("/random", async (req, res) => {
  try {
    const randomSeries = await Series.aggregate([{ $sample: { size: 1 } }]);
    // 'randomSeries' will contain an array with one randomly selected Series document
    // Send the random Series as the response
    res.json(randomSeries[0]); // Send the first (and only) item from the array
  } catch (err) {
    console.error("Error getting a random Series:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//DELETE
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Series.findByIdAndDelete(req.params.id);
    res.status(200).json("The Series has been deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:seriesId/:episodeId", async (req, res) => {
  try {
    const { seriesId, episodeId } = req.params;

    // Convert seriesId and episodeId to ObjectId
    const seriesObjectId = new ObjectId(seriesId);
    const episodeObjectId = new ObjectId(episodeId);

    // Find the series by seriesId
    const series = await Series.findById(seriesObjectId);

    if (!series) {
      return res.status(404).json({ error: "Series not found" });
    }

    // Iterate through all seasons in the series
    let episode = null;
    for (const season of series.seasons) {
      episode = season.episodes.find((episode) =>
        episode._id.equals(episodeObjectId)
      );
      if (episode) {
        break; // Exit the loop once the episode is found
      }
    }

    if (!episode) {
      return res.status(404).json({ error: "Episode not found" });
    }

    res.json(episode);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update episode watching progress for a series
router.put("/:seriesId/:episodeId/progress", async (req, res) => {
  try {
    const seriesId = req.params.seriesId;
    const episodeId = req.params.episodeId;
    const progress = req.body.episodeProgress;

    // Find the series by ID
    const series = await Series.findById(seriesId);

    if (!series) {
      return res.status(404).json({ message: "Series not found" });
    }

    // Iterate through all seasons in the series
    for (const season of series.seasons) {
      const episode = season.episodes.id(episodeId);

      if (episode) {
        // Update the progress for the specific episode
        episode.episodeProgress = progress;
        break; // Exit the loop once the episode is found
      }
    }

    // Save the updated series
    const updatedSeries = await series.save();

    res.status(200).json(updatedSeries);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET all series
router.get("/all", async (req, res) => {
  try {
    const series = await Series.find();
    res.status(200).json(series);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put(
  "/:seriesId/seasons/:seasonNumber/episodes/:episodeId",
  async (req, res) => {
    try {
      const { seriesId, seasonNumber, episodeId } = req.params;
      const updatedEpisodeData = req.body;

      // Find the series by ID
      const series = await Series.findById(seriesId);

      if (!series) {
        return res.status(404).json({ message: "Series not found" });
      }

      // Find the season by season number
      const season = series.seasons.find(
        (s) => s.seasonNumber === parseInt(seasonNumber, 10)
      );

      if (!season) {
        return res.status(404).json({ message: "Season not found" });
      }

      // Find the episode by episode ID
      const episodeIndex = season.episodes.findIndex((e) => e._id == episodeId);

      if (episodeIndex === -1) {
        return res.status(404).json({ message: "Episode not found" });
      }

      // Update the episode data with the provided data
      season.episodes[episodeIndex] = {
        ...season.episodes[episodeIndex],
        ...updatedEpisodeData,
      };

      // Save the updated series
      await series.save();

      return res
        .status(200)
        .json({
          message: "Episode updated successfully",
          episode: season.episodes[episodeIndex],
        });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    // Use a regular expression to perform a case-insensitive search
    const movies = await Series.find({
      $or: [
        { title: { $regex: query, $options: "i" } },
        { director: { $regex: query, $options: "i" } },
        { cast: { $in: [new RegExp(query, "i")] } },
        { tags: { $in: [new RegExp(query, "i")] } },
      ],
    });

    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
