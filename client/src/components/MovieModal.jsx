import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Play, Plus, X, Check, CaretDown } from "@phosphor-icons/react";
import ProgressBar from "./ProgressBar";
import Episode from "./Episode";
import RecommendedContent from "./RecommendedContent";
import { useMyContext } from "../MyContext";
import "./movieModal.scss";
import API from "../apiConfig";

import {
  getSlideInKeyframes,
  getZoomOutKeyframes,
  getZoomOutFeaturedKeyframes,
  getZoomInFeaturedKeyframes,
} from "./animation";

const MovieModal = ({ onModalOpenChange }) => {
  const {
    movieDataFromListItem,
    listItemCoords,
    updateListItemCoords,
    movieDataFromFeatured,
  } = useMyContext();
  const [movie, setMovie] = useState({
    cast: [],
    genres: [],
    tags: [],
  }); //field: []; ensure that these properties are always defined, even when the initial data may not provide values for them
  const [selectedSeason, setSelectedSeason] = useState(1); //default selected season is set to season 1

  const handleSelectChange = (event) => {
    setSelectedSeason(Number(event.target.value)); //handle change of selected season from <Select>
  };

  
  // Separate function for fetching data
  const fetchData = async (id) => {
    try {
      // Define the initial URL for movies
      const url = `${API}/movies/find/${id}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Attempt to fetch data from the first URL
      const data = await response.json();

      // If data is null, try the second URL for series
      if (data === null) {
        const secondUrl = `${API}/series/find/${id}`;
        const secondResponse = await fetch(secondUrl);

        if (!secondResponse.ok) {
          throw new Error(`HTTP error! Status: ${secondResponse.status}`);
        }

        // If successful, return data from the second URL (series)
        const secondData = await secondResponse.json();
        return secondData;
      }

      // If data is not null, return data from the first URL (movies)
      return data;
    } catch (err) {
      // Properly handle errors by re-throwing them
      throw err;
    }
  };

  useEffect(() => {
    // Get the current URL
    const currentUrl = window.location.href;

    // Attempt to match the URL with a product ID
    const idMatch = currentUrl.match(/#\/product\/([^/]+)/);
    const id = idMatch ? idMatch[1] : null;

    // Determine the data source based on modal origin
    const dataToUse = !modalFromFeatured
      ? movieDataFromListItem
      : movieDataFromFeatured;

    // If data is available from the selected source, update URL and set movie data
    if (dataToUse) {
      const newUrl = `#/product/${dataToUse._id}`;
      window.history.replaceState(null, "", newUrl);
      setMovie(dataToUse);
    } else if (id) {
      // If no data is available, fetch data based on the product ID from the URL
      fetchData(id)
        .then((data) => setMovie(data))
        .catch((err) => console.error(err));
    }

  }, [movieDataFromListItem, movieDataFromFeatured]);

  const findLatestEpisodeWithProgress = () => {
    const currentUrl = window.location.href;

    // Attempt to match the URL with a product ID
    const idMatch = currentUrl.match(/#\/product\/([^/]+)/);
    const id = idMatch ? idMatch[1] : null;

    if (user) {
      let latestWithProgress = null;
      // Iterate over each series in the user's watched series
      user.watchedSeries.forEach((series) => {
        // Check if the series id matches the provided movieId

        if (series.series === id) {
          // Iterate over each season in the series
          for (const season of series.seasons) {
            // Iterate over each episode in the season
            for (let i = season.episodes.length - 1; i >= 0; i--) {
              const episode = season.episodes[i];
              if (episode.progress > 0) {
                latestWithProgress = episode;
                //console.log(latestWithProgress)
                break; // Stop searching when a valid episode is found
              }
            }
          }
        }
      });
      // Return the latest episode with progress, or null if none found
      //console.log(latestWithProgress)
      

      if(latestWithProgress==null){
        latestWithProgress = movie.seasons[0].episodes[0];
      }
      return latestWithProgress;
    }
  };

  const [triggerCloseModalAnimation, settriggerCloseModalAnimation] =
    useState(true);
  const modalFromFeatured =
    listItemCoords.left === 0 && listItemCoords.top === 0;

  const sendDataToParent = () => {
    settriggerCloseModalAnimation(false);
    setTimeout(() => {
      onModalOpenChange(false);
      updateListItemCoords({ top: 0, left: 0 });
    }, 450);
  };

  // Check if listItemCoords exists
  const listItemExists = typeof listItemCoords !== "undefined";

  // Function to create and append a <style> element with the provided CSS
  function createStyleElement(css) {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = css;
    document.head.appendChild(styleElement);
  }

  // If listItemCoords exists, create and append style elements for keyframes
  if (listItemExists) {
    // Generate an array of keyframes
    const keyframes = [
      getSlideInKeyframes(listItemCoords),
      getZoomOutKeyframes(listItemCoords),
      getZoomOutFeaturedKeyframes(),
      getZoomInFeaturedKeyframes(),
    ];

    // Create and append a <style> element for each keyframe
    keyframes.forEach((keyframe) => createStyleElement(keyframe));
  }

  // Initialize modalAnimationStyle object
  let modalAnimationStyle = {};

  // Determine the animation style based on conditions (modal source)
  if (listItemCoords && !modalFromFeatured) {
    modalAnimationStyle = {
      animationName: triggerCloseModalAnimation ? "slideIn" : "zoomOut",
      animationDuration: triggerCloseModalAnimation ? "0.8s" : "0.5s",
    };
  } else if (modalFromFeatured) {
    modalAnimationStyle = {
      animationName: triggerCloseModalAnimation
        ? "zoomInFeatured"
        : "zoomOutFeatured",
      animationDuration: "0.8s",
    };
  }
  const [user, setUser] = useState();

  useEffect(() => {
    // Check if user data exists in localStorage
    const savedUserData = localStorage.getItem("userData");
    if (savedUserData) {
      // If user data exists in localStorage, parse it
      const data = JSON.parse(savedUserData);

      if (data) {
        const userId = data._id;
        console.log(userId)

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
  const [buttonText, setButtonText] = useState("");

  useEffect(() => {
    if (movie.seasons) {
      const latestEpisodeWithProgress = findLatestEpisodeWithProgress();

      if (latestEpisodeWithProgress) {
        
        if (latestEpisodeWithProgress.progress > 0) {
          setButtonText("Resume");
        } else {
          setButtonText("Play");
        }
      }
    
    } else if (user && user.watchedMovies) {
      const movieIndex = user.watchedMovies.findIndex(
        (item) => item.movie === movie._id
      );

      if (movieIndex !== -1 && user.watchedMovies[movieIndex]) {
        if (user.watchedMovies[movieIndex].progress > 0) {
          setButtonText("Resume");
        } else {
          setButtonText("Play");
        }
      } else {
        // Handle the case when user.watchedMovies[movieIndex] is not found
        setButtonText("Play");
      }
    }
  }, [movie, user]);

  const findMovieProgress = () => {
    if (user && user.watchedMovies && movie) {
      const movieIndex = user.watchedMovies.findIndex(
        (item) => item.movie === movie._id
      );

      if (movieIndex !== -1 && user.watchedMovies[movieIndex]) {
        return user.watchedMovies[movieIndex].progress;
      }
    }
    return 0;
  };

  const { watchlist, addToWatchlist, removeFromWatchlist } = useMyContext();
  const handleAddItem = () => {
    addToWatchlist(movie._id);
  };

  const handleRemoveItem = () => {
    removeFromWatchlist(movie._id);
  };

  return (
    <div className="modalContent" style={modalAnimationStyle}>
      { movie ? ( 
        <>
          <X
            className={`close ${
              triggerCloseModalAnimation || modalFromFeatured
                ? ""
                : "hideContent"
            }`}
            onClick={sendDataToParent}
          />

          {movie.seasons &&
            triggerCloseModalAnimation && ( // Render a season selection dropdown if there are seasons and animation is triggered
              <div className="modalCat ">
                <select value={selectedSeason} onChange={handleSelectChange}>
                  {movie.seasons.map((season, index) => (
                    <option key={index} value={index + 1}>
                      {`Season ${index + 1}`}
                    </option>
                  ))}
                </select>
                <CaretDown className="arrow" weight="fill" size={12} />
              </div>
            )}
          {/* Render video or image based on conditions */}
          {((triggerCloseModalAnimation ||
            modalFromFeatured) &&
            (movie.video !== "" && movie.video? (
              <video className="coverVideo" autoPlay loop muted preload="auto">
                <source src={movie.video} type="video/mp4" />
              </video>
            ) : (
              <img className="coverVideo" src={movie.imgFeatured} alt="" />
            ))) || <img className="coverImg" src={movie.imgThumbnail} alt="" />}
          {/* Render movie details based on conditions */}
          <div
            className={`modalDetails ${
              triggerCloseModalAnimation ||
              modalFromFeatured
                ? ""
                : "hideContent"
            }`}
          >
            <div className="left">
              <div className="top">
                <img className="titleImg" src={movie.imgTitle} alt="" />

                {movie.seasons && selectedSeason && findLatestEpisodeWithProgress()?.progress && (
                  <ProgressBar
                    className="progress"
                    progress={findLatestEpisodeWithProgress()?.progress}
                  />
                )}
                {movie && !movie.seasons && findMovieProgress() > 0 && (
                  <ProgressBar
                    className="progress"
                    progress={findMovieProgress()}
                  />
                )}
                <div className="buttons">
                  <Link
                    to={`/product/${movie._id}/watch/${movie.seasons
                      ? findLatestEpisodeWithProgress()?.episode 
                      : ""}`}
                  >
                    <button className="play">
                      <Play className="iconPlay" weight="fill" />
                      <span>{buttonText}</span>
                    </button>
                  </Link>
                  {(watchlist && watchlist.includes(movie._id)) ||
                  (!watchlist &&
                    user &&
                    user.favoriteMovies &&
                    user.favoriteMovies.includes(movie._id) &&
                    user.favoriteMovies.includes(movie._id)) ? (
                    <Check
                      color="#ffffff"
                      className="add"
                      weight="bold"
                      onClick={handleRemoveItem}
                    /> // Display CheckCircle if item is in watchlist
                  ) : (
                    <Plus
                      color="#ffffff"
                      className="add"
                      weight="bold"
                      onClick={handleAddItem}
                    /> // Display Plus if item is not in watchlist
                  )}
                </div>
              </div>

              <div className="middle">
                <div className="technical">
                  <span>{movie.releaseDate}</span>
                  <span>1h 20min</span>
                </div>

                <div className="limits">
                  <span className="rating">{movie.ageLimit}</span>
                  <span>drugs, nudity, example, example</span>
                  <div className="description">{movie.description}</div>
                </div>
              </div>
            </div>

            <div className="right">
              <div className="cast">
                <span className="label">Cast: </span>
                <span>{movie.cast.slice(0, 3).join(", ")}</span>
              </div>
              <div className="genres">
                <span className="label">Genres: </span>
                <span>{movie.genres.slice(0, 3).join(", ")}</span>
              </div>
              <div className="tags">
                <span className="label">This movie is: </span>
                <span>{movie.tags.slice(0, 3).join(", ")}</span>
              </div>
            </div>
          </div>

          <div
            className={`bottom ${
              triggerCloseModalAnimation ||
              modalFromFeatured
                ? ""
                : "hideContent"
            }`}
          >
            {movie.seasons &&
              user && ( // Render episodes section if there are seasons
                <div className="episodes">
                  <h2>Episodes</h2>
                  {movie.seasons[selectedSeason - 1]?.episodes.map(
                    (episode, episodeIndex) => (
                      <Episode
                        key={episodeIndex}
                        index={episodeIndex}
                        episode={episode}
                        user={user}
                      />
                    )
                  )}
                </div>
              )}
            <h2>More Like This</h2>
            <div className="recommendedContentContainer">
              <RecommendedContent />
              <RecommendedContent />
              <RecommendedContent />
              <RecommendedContent />
              <RecommendedContent />
              <RecommendedContent />
            </div>
                    
          </div>
        </>
      ) : (
        <p>Movie data is not available</p>
      )}
    </div>
  );
};

export default MovieModal;
