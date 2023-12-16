import React from "react";
import "./episode.scss";
import { Link } from "react-router-dom";
import ProgressBar from "./ProgressBar";

const Episode = ({ episode, user, index }) => {
  // Extract the movieId from the current URL
  const currentUrl = window.location.href;
  const movieId = currentUrl.split("/product/")[1];

  // Construct the new URL by combining the parts
  const newUrl = `/product/${movieId}/watch/${episode._id}`;

  // Find the progress of the current episode in the user's watchedSeries
  const findEpisodeProgress = (user, episodeIdToFind) => {
    for (const series of user.watchedSeries) {
      for (const season of series.seasons) {
        const foundEpisode = season.episodes.find(
          (episode) => episode.episode === episodeIdToFind
        );
        if (foundEpisode) {
          return foundEpisode.progress; // Return the progress of the episode
        }
      }
    }
    return null; // Return null if the episode is not found
  };

  return (
    <div className="episode">
      <span className="epNumber">{index + 1}</span>
      <div className="image">
        {/* Create a link to the episode and handle the click event */}
        <Link to={newUrl}>
          <img src={episode.thumbnail} alt="" />
        </Link>
        {/* Display the progress bar if progress is greater than 0 */}
        {episode && findEpisodeProgress(user, episode._id) > 0 && (
          <ProgressBar
            className="progressEpisode"
            progress={findEpisodeProgress(user, episode._id)}
          />
        )}
      </div>
      <div className="details">
        <h1>{episode.title}</h1>
        <span className="description">{episode.description}</span>
      </div>
      <span className="time">25min</span>
    </div>
  );
};

export default Episode;
