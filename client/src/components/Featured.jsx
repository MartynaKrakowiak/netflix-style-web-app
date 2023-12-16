import React, { useEffect, useState } from "react";
import { useMyContext } from "../MyContext";
import { Link } from "react-router-dom";
import "./featured.scss";
import { Play, Info, CaretDown } from "@phosphor-icons/react";
import API from "../apiConfig";

const Featured = ({ type, onModalOpenChange }) => {
  const { updateSelectListGenre } = useMyContext();
  const [randomMovie, setRandomMovie] = useState({});

  const openModal = () => {
    onModalOpenChange(true); // Call the function to open the modal in the Home component
  };

  const { updatemovieDataFromFeatured } = useMyContext();

  useEffect(() => {
    async function fetchData() {
      try {
        const randomType =
          type === "movies" || type === "series"
            ? type
            : Math.random() < 0.5
            ? "movies"
            : "series";
        const url = `${API}/${randomType}/random/`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setRandomMovie(data);
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    }

    fetchData();
  }, [type]);

  const [user, setUser] = useState();
  useEffect(() => {
    // Check if user data exists in localStorage
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

  const findLatestEpisodeWithProgressId = () => {

    if (user && randomMovie && randomMovie.seasons) {
      
      let latestWithProgress = null;
      // Iterate over each series in the user's watched series
      user.watchedSeries.forEach((series) => {
        // Check if the series id matches the provided movieId

        if (series.series === randomMovie._id) {
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
        return randomMovie.seasons[0].episodes[0]._id;
      }
      else{
        return latestWithProgress.episode;
      }
    }
  };


  return (
    <div className="featured">
      {type && (
        <div className="category">
          <span>{type === "movies" ? "Movies" : "Series"}</span>
          <select
            name="genre"
            id="genre"
            onChange={(e) => updateSelectListGenre(e.target.value)}
            className="column-select"
          >
            <option value="">Genre</option>
            <option value="33">Adventure</option>
            <option value="comedy">Comedy</option>
            <option value="crime">Crime</option>
            <option value="fantasy">Fantasy</option>
            <option value="historical">Historical</option>
            <option value="horror">Horror</option>
            <option value="romance">Romance</option>
            <option value="sci-fi">Sci-fi</option>
          </select>
          <CaretDown className="arrow" weight="fill" size={12} />
        </div>
      )}
      <img className="imgFeatured" src={randomMovie.imgFeatured} alt="" />
      <div className="details">
        <img className="imgTitle" src={randomMovie.imgTitle} alt="" />
        <div className="description">{randomMovie.description}</div>
        <div className="buttons">
          <Link
            to={`/product/${randomMovie._id}/watch/${
              randomMovie.seasons ? findLatestEpisodeWithProgressId() : ""
            }`}
          >
            <button className="play">
              <Play weight="fill" size={36} />
              <span>Play</span>
            </button>
          </Link>
          <button
            className="info"
            onClick={() => {
              updatemovieDataFromFeatured(randomMovie);
              openModal();
            }}
          >
            <Info size={36} />
            <span>More Info</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Featured;
