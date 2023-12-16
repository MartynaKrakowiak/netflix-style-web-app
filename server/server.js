const express = require("express");
const mongoose = require("mongoose");
const movieRoute = require("./routes/movies");
const seriesRoute = require("./routes/series");
const listRoute = require("./routes/lists");
const usersRoute = require("./routes/users");
const dotenv = require("dotenv");
const app = express();
const PORT = 8800;
dotenv.config();
async function main() {
  try {
    //console.log("MongoDB URL:", process.env.MONGO_URL);
    await mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("DB connection sccessfull"));
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1); 
  }
}

main().then(() => {
  app.use(express.json());
  app.use("/server/movies", movieRoute);
  app.use("/server/series", seriesRoute);
  app.use("/server/lists", listRoute);
  app.use("/server/users", usersRoute);

  app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
  });
});