import React, { useContext, useEffect, useState, useRef } from "react";
import "../watch/watch.scss";
import { ArrowLeft } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { useMyContext } from "../../MyContext"; // Adjust the import path as needed
import API from "../../apiConfig";

const Watch = () => {
  const [user, setUser] = useState();
  const videoRef = useRef(null);
  const currentUrl = window.location.href;
  const [movie, setMovie] = useState();
  const { updateListItemCoords } = useMyContext();

  const handleClick = () => {
    updateListItemCoords({ top: 0, left: 0 });
  };

  const onLoadedMetadata = () => {
    // Ensure that both user and movie are defined
    if (user && movie) {
      // Find the index of the movie in watchedMovies based on its ID
      const movieIndex = user.watchedMovies.findIndex(
        (item) => item.movie === movie._id
      );
      console.log(movieIndex);

      if (movieIndex !== -1) {
        const durationInSeconds = videoRef.current.duration;
        const currentTime =
          (user.watchedMovies[movieIndex].progress / 100) * durationInSeconds;

        // Check if currentTime is a finite floating-point value
        if (!isNaN(currentTime) && isFinite(currentTime)) {
          videoRef.current.currentTime = currentTime;
        } else {
          console.error("Invalid currentTime value:", currentTime);
        }
      }
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
          })
          .catch((error) => {
            console.error("Error fetching user data:", error);
          });
      }
    }
  }, []);

  useEffect(() => {
    // Access the user data and perform any operations that depend on it here
    if (user) {
      const pathnameParts = currentUrl.split("/");
      const movieIdFromURL = pathnameParts[5]; // Assuming movieId is the third part of the path

      // Make a GET request to the API endpoint using the extracted movieId
      fetch(`${API}/movies/find/${movieIdFromURL}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((movieData) => {
          // Handle the movie data here
          setMovie(movieData);
          console.log("Movie Data:", movieData);
          const isMovieWatched = user.watchedMovies.some(
            (item) => item.movie._id === movieIdFromURL
          );
          console.log(isMovieWatched);

          if (!isMovieWatched) {
            // Use POST to add the movie to user.watchedMovies
            fetch(`${API}/users/${user._id}/add-movie/${movieIdFromURL}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ progress: 0 }), // Assuming initial progress is 0
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json(); // Parse the response JSON
              })
              .then((result) => {
                console.log("Movie added to watchedMovies:", result);
              })
              .catch((error) => {
                console.error("Error adding movie to watchedMovies:", error);
              });
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  }, [user, currentUrl]);

  const handleTimeUpdate = () => {
    // Check if the video duration is available and not NaN
    if (videoRef.current && !isNaN(videoRef.current.duration)) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      const progress = (currentTime / duration) * 100;
      console.log("Duration:", duration);
      console.log("Current Time:", currentTime);
      // Update episode progress on the server
      updateMovieProgress(progress);
    }
  };

  const updateMovieProgress = async (progress) => {
    try {
      const pathnameParts = currentUrl.split("/");
      const movieIdFromURL = pathnameParts[5]; // Assuming movieId is the third part of the path

      const response = await fetch(
        `${API}/users/${user._id}/edit-movie/${movieIdFromURL}`, // Updated URL
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

      // Update the movie state with the new progress
      // Find the index of the movie in watchedMovies based on its ID
      const movieIndex = user.watchedMovies.findIndex(
        (item) => item.movie._id === movieIdFromURL
      );

      // Update the progress for that specific movie
      if (movieIndex !== -1) {
        user.watchedMovies[movieIndex].progress = progress;
      }

      // Update the user state with the updated watchedMovies
      setUser((prevUser) => ({
        ...prevUser,
        watchedMovies: [...prevUser.watchedMovies], // Make a shallow copy of the array
      }));
    } catch (error) {
      console.error("Error updating movie progress:", error);
    }
  };
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
      {movie && (
        <video
          className="video"
          autoPlay
          controls
          ref={videoRef}
          src={movie.video}
          onLoadedMetadata={onLoadedMetadata} // Handle metadata loaded event
          onTimeUpdate={handleTimeUpdate} // Handle time update event
        />
      )}
    </div>
  );
};

export default Watch;
