import React, { useRef, useState, useEffect } from "react";
import { useMyContext } from "../MyContext";
import { Play, Plus, CaretDown, Check } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import "./listItem.scss";

import API from "../apiConfig";
const ListItem = ({
  itemNumber,
  item,
  onModalOpenChange,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}) => {
  const ref = useRef(null);

  const {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    updateData,
    loginUser,
  } = useMyContext();

  const { updateListItemCoords } = useMyContext({
    top: 0,
    left: 0,
  });

  const [user, setUser] = useState();
  useEffect(() => {
    // Check if user data exists in localStorage
    const savedUserData = localStorage.getItem("userData");
    if (savedUserData) {
      // If user data exists in localStorage, parse it

      const data = JSON.parse(savedUserData);
      //console.log(data)
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

  const handleCaretClick = () => {
    if (movie) {
      updateData(movie);
      onModalOpenChange(true);
    }

    const rect = ref.current.getBoundingClientRect();
    let tempTop = rect.top;
    let tempLeft = rect.left;

    //A temporary solution is in place to adjust the X and Y positions of ListItem elements due to scaling and hover.
    //However, this solution needs further improvement to make it cleaner and more sustainable.
    if (itemNumber % 6 === 0) {
      tempTop -= 30;
      tempLeft -= 180;
    } else if ([1, 7, 13, 19].includes(itemNumber)) {
      tempLeft -= 310;
      tempTop -= 30;
    } else {
      tempLeft -= 248;
      tempTop -= 10;
    }

    updateListItemCoords({
      top: tempTop,
      left: tempLeft,
    });
  };

  const handleAddItem = () => {
    addToWatchlist(item);
  };

  const handleRemoveItem = () => {
    removeFromWatchlist(item);
  };

  const [movie, setMovie] = useState({});
  useEffect(() => {
    const getMedia = async () => {
      try {
        let url = `${API}/movies/find/${item}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        if (data === null) {
          // If data is null, fetch data from a second path
          const secondUrl = `${API}/series/find/${item}`;
          const secondResponse = await fetch(secondUrl);

          if (!secondResponse.ok) {
            throw new Error(`HTTP error! Status: ${secondResponse.status}`);
          }

          const secondData = await secondResponse.json();
          setMovie(secondData);
          //console.log(secondData);
          // updateData(item);
        } else {
          // If data is not null, set it in the state
          //console.log(data)
          setMovie(data);
          //updateData(item);
        }
      } catch (err) {
        console.error(err);
      }
    };

    getMedia();
  }, [item]);

  if (!movie || !movie.tags || movie.tags.length === 0) {
    return null; // Handle the case of missing tags
  }

  const separatorStyle = {
    color: "gray",
    margin: "0 5px", // Adjust the margin to increase spacing
  };

  const textStyle = {
    color: "white",
  };

  // Concatenating tags into a single string with a "•" separator and applying styles
  const formattedTags = movie.tags.map((tag, index) => (
    <span key={index}>
      {index > 0 && <span style={separatorStyle}>•</span>}
      <span style={textStyle}>{tag}</span>
    </span>
  ));

  const findLatestEpisodeWithProgressId = () => {

    if (user && movie && movie.seasons) {
      
      let latestWithProgress = null;
      // Iterate over each series in the user's watched series
      user.watchedSeries.forEach((series) => {
        // Check if the series id matches the provided movieId

        if (series.series === movie._id) {
          // Iterate over each season in the series
          for (const season of series.seasons) {
            // Iterate over each episode in the season
            for (let i = season.episodes.length - 1; i >= 0; i--) {
              const episode = season.episodes[i];
              if (episode.progress > 0) {
                latestWithProgress = episode;
                break; // Stop searching when a valid episode is found
              }
            }
          }
        }
      });

      if(latestWithProgress == null){
        return movie.seasons[0].episodes[0]._id;
      }
      else{
        return latestWithProgress.episode;
      }
    }
  };

  return (
    <div
      ref={ref}
      className={`listItem ${itemNumber % 6 === 0 ? "special" : ""} ${
        [1, 7, 13, 19].includes(itemNumber) ? "special left" : ""
      }  ${isHovered ? "hovered" : ""} `}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <img src={movie.imgThumbnail} alt="" />

      {isHovered && (
        <div className="fadeIn">
          <video autoPlay loop muted>
            <source src={movie.video} type="video/mp4" />
          </video>
        </div>
      )}
      {isHovered && (
        <div className="listItemDetails">
          <div className="icons">
            <Link
              to={`/product/${movie._id}/watch/${
                movie.seasons ? findLatestEpisodeWithProgressId() : ""
              }`}
            >
              <Play weight="fill" className="play" />
            </Link>
            {/*To improve */}
            {(watchlist && watchlist.includes(item)) ||
            (!watchlist && user && user.favoriteMovies.includes(item)) ? (
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

            <CaretDown
              color="#ffffff"
              className="more"
              onClick={handleCaretClick}
            />
          </div>

          <p>
            <div className="limit">{movie.ageLimit}</div>
            <div className="duration">1h 25min</div>{" "}
          </p>

          <p>{formattedTags.slice(0, 3)}</p>
          <br></br>
        </div>
      )}
    </div>
  );
};

export default ListItem;
