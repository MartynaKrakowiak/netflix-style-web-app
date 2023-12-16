const router = require("express").Router();
const List = require("../models/List");
const verifyToken = require("../verifyToken");

//CREATE
router.post("/", verifyToken, async (req, res) => {
  const newList = new List(req.body);
  try {
    const savedList = await newList.save();
    res.status(201).json(savedList);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET

router.get("/", async (req, res) => {
  const typeQuery = req.query.type;
  const genreQuery = req.query.genre;
  let list = [];

  try {
    const aggregationPipeline = [{ $sample: { size: 10 } }];

    if (genreQuery) {
      aggregationPipeline.push({ $match: { genres: genreQuery } });
    }

    if (typeQuery === "movies") {
      list = await List.aggregate([
        ...aggregationPipeline,
        { $unwind: "$content" },
        {
          $match: {
            $or: [
              { "content.seasons": { $exists: false } },
              { "content.seasons": { $eq: [] } }, // Check if 'seasons' is an empty array
            ],
          },
        },
        {
          $group: {
            _id: "$_id",
            title: { $first: "$title" },
            content: { $push: "$content" },
          },
        },
      ]);

      // Log the 'movies' aggregation pipeline result
      //console.log("Movies Pipeline Result:", list);
    } else if (typeQuery === "series") {
      list = await List.aggregate([
        ...aggregationPipeline,
        { $unwind: "$content" },
        {
          $match: {
            "content.seasons": { $ne: [] },
          },
        },
        {
          $group: {
            _id: "$_id",
            title: { $first: "$title" },
            content: { $push: "$content" },
          },
        },
      ]);

      // Log the 'series' aggregation pipeline result
     // console.log("Series Pipeline Result:", list);
    } else if (!typeQuery && !genreQuery) {
      const randomPlaylists = await List.aggregate([{ $sample: { size: 10 } }]);
      list = randomPlaylists;

      // Log the generic aggregation pipeline result
      //console.log("Generic Pipeline Result:", list);
    }

    res.status(200).json(list);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET route to find a list by ID
router.get("/find/:listId", async (req, res) => {
  const listId = req.params.listId;

  try {
    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ message: "List not found" });
    }
    res.status(200).json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET all lists
router.get("/all", verifyToken, async (req, res) => {
  try {
    const lists = await List.find();
    res.status(200).json(lists);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", async (req, res) => {
  try {
    await List.findByIdAndDelete(req.params.id);
    res.status(200).json("The list has been deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

// PUT route to update a list by ID
router.put("/:id", verifyToken, async (req, res) => {
  const listId = req.params.id;
  const updateData = req.body; // This should contain the updated data

  try {
    // Find the list by ID and update it
    const updatedList = await List.findByIdAndUpdate(listId, updateData, {
      new: true, // To return the updated list
    });

    if (!updatedList) {
      return res.status(404).json({ message: "List not found" });
    }

    res.status(200).json(updatedList);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
