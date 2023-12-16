const router = require("express").Router();
const Movie = require("../models/Movie");
const verifyToken = require("../verifyToken");
//CREATE
router.post("/", verifyToken, async (req, res) => {
    const newMovie = new Movie(req.body);
      try {
        const savedMovie = await newMovie.save();
        res.status(201).json(savedMovie);
      } catch (err) {
        res.status(500).json(err);
      }
    } 
);

//UPDATE
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const updatedMovie = await Movie.findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body,
          },
          { new: true }
        );
        res.status(200).json(updatedMovie);
      } catch (err) {
        res.status(500).json(err);
      }
    } 
  );

//GET
router.get("/find/:id", async (req, res) => {
    try {
      const movie = await Movie.findById(req.params.id);
      res.status(200).json(movie);
    } catch (err) {
      res.status(500).json(err);
    }
  });

//GET RANDOM
router.get("/random", async (req, res) => {
    try {
       const randomMovie = await Movie.aggregate([{ $sample: { size: 1 } }]);
       res.json(randomMovie[0]); // Send the first (and only) item from the array
    } catch (err) {
      console.error("Error getting a random movie:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
//DELETE
router.delete("/:id", verifyToken, async (req, res) => {
    try {
      await Movie.findByIdAndDelete(req.params.id);
      res.status(200).json("The movie has been deleted");
    } catch (err) {
      res.status(500).json(err);
    }
  }
);


router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;

    // Use a regular expression to perform a case-insensitive search
    const movies = await Movie.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { director: { $regex: query, $options: 'i' } },
        { cast: { $in: [new RegExp(query, 'i')] } },
        { tags: { $in: [new RegExp(query, 'i')] } },
      ],
    });

    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.put("/:movieId/progress", async (req, res) => {
  try {
    const movieId = req.params.movieId;
    const progress = req.body.progress;
    //console.log(movieId)

    // Find the movie by ID
    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Update the progress for the specific movie
    movie.progress = progress;

    // Save the updated movie
    const updatedMovie = await movie.save();

    res.status(200).json(updatedMovie);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET all movies
router.get("/all", verifyToken, async (req, res) => {
  try {
      const movies = await Movie.find();
      res.status(200).json(movies);
  } catch (err) {
      res.status(500).json(err);
  }
});


module.exports = router;