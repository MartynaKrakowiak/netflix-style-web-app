import React, { useContext, useEffect, useState, useRef } from "react";
import "../watch/watch.scss";
import { ArrowLeft } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { useMyContext } from "../../MyContext";
import API from "../../apiConfig";
const Watch = () => {
  const videoRef = useRef(null);

  const currentUrl = window.location.href;
  const [episode, setEpisode] = useState();
  const { updateListItemCoords } = useMyContext();
  const [user, setUser] = useState();

  const handleClick = () => {
    updateListItemCoords({ top: 0, left: 0 });
  };

  const onLoadedMetadata = () => {
    // When metadata is loaded, check if episode progress is available
    if (
      episode &&
      user &&
      user.watchedSeries &&
      user.watchedSeries.length > 0
    ) {
      const episodeId = episode._id;
      // Iterate through all watched series
      for (const series of user.watchedSeries) {
        // Iterate through all seasons of the current series
        for (const season of series.seasons) {
          // Find the episode with a matching _id
          const foundEpisode = season.episodes.find(
            (episode) => episode.episode === episodeId
          );

          if (foundEpisode) {
            const episodeProgress = foundEpisode.progress;
            const durationInSeconds = videoRef.current.duration;
            const currentTime = (episodeProgress / 100) * durationInSeconds;

            // Check if currentTime is a finite floating-point value
            if (!isNaN(currentTime) && isFinite(currentTime)) {
              videoRef.current.currentTime = currentTime;
              return;
            }
          }
        }
      }
    }
  };

  const updateEpisodeProgress = async (progress) => {
    try {
      const pathnameParts = currentUrl.split("/");

      const seriesIdFromURL = pathnameParts[5];
      const episodeIdFromURL = pathnameParts[7];

      const response = await fetch(
        `${API}/users/${user._id}/edit-series-progress/${seriesIdFromURL}/${episodeIdFromURL}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ progress }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Update the episode state with the new progress
      setUser((prevUser) => ({
        ...prevUser,
        watchedSeries: [...prevUser.watchedSeries],
      }));
    } catch (error) {
      console.error("Error updating episode progress:", error);
    }
  };

  const handleTimeUpdate = () => {
    // Check if the video duration is available and not NaN
    if (videoRef.current && !isNaN(videoRef.current.duration)) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      const episodeProgress = (currentTime / duration) * 100;
      // console.log("Duration:", duration);
      // console.log("Current Time:", currentTime)
      // Update episode progress on the server
      updateEpisodeProgress(episodeProgress);
    }
  };

  useEffect(() => {
    // Make a GET request to the API endpoint to fetch user data
    const savedUserData = localStorage.getItem("userData");
    if (savedUserData) {
      // If user data exists in localStorage, parse it
      const data = JSON.parse(savedUserData);

      // Ensure that the user object and user._id exist
      if (data) {
        const userId = data._id;

        // Make a GET request to the API endpoint to fetch user data
        fetch(`${API}/users/find/${userId}`)
          .then((response) => {
            if (!response.ok) {
              throw Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then((userData) => {
            // Update user state with the fetched data
            setUser(userData);
            //console.log(userData)
            
          })
          .catch((error) => {
            console.error("Error fetching user data:", error);
          });
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      const pathnameParts = currentUrl.split("/");
      const seriesIdFromURL = pathnameParts[5];
      const episodeIdFromURL = pathnameParts[7];
      // Check if the series is already in watchedSeries
      const isSeriesWatched = user.watchedSeries.some(
        (item) => item.series._id === seriesIdFromURL
      );

      if (!isSeriesWatched) {
        // Make a GET request to the API endpoint to fetch series data using the extracted seriesId
        fetch(`${API}/series/${seriesIdFromURL}/${episodeIdFromURL}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
          })
          .then((seriesData) => {
            // Handle the series data here
            console.log("Series Data:", seriesData);
            setEpisode(seriesData);

            // Use POST to add the series to user.watchedSeries
            fetch(`${API}/users/${user._id}/add-series/${seriesIdFromURL}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(seriesData), // Send the series data with progress
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
              })
              .then((result) => {
                console.log("Series added to watchedSeries:", result);
              })
              .catch((error) => {
                console.error("Error adding series to watchedSeries:", error);
              });
          })
          .catch((error) => {
            console.error("Error:", error);
          });
      }
    }
  }, [user, currentUrl]);

  const hashIndex = currentUrl.indexOf("#");
  const strippedUrlWithHash = currentUrl.substring(hashIndex + 1);
  const segments = strippedUrlWithHash.split("/");
  const desiredPath = segments.slice(0, 3).join("/");

  return (
    <div className="watch">
      <Link to={desiredPath} onClick={handleClick}>
        <div className="back">
          <ArrowLeft />
          Home
        </div>
      </Link>
      {episode && (
        <video
          className="video"
          autoPlay
          controls
          ref={videoRef}
          src={episode.video}
          onLoadedMetadata={onLoadedMetadata} // Handle metadata loaded event
          onTimeUpdate={handleTimeUpdate} // Handle time update event
        />
      )}
    </div>
  );
};

export default Watch;
