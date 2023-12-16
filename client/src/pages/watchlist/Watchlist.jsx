import React, { useState, useEffect } from "react";
import Topbar from "../../components/Topbar";
import "./watchlist.scss";
import RowWatchlist from "./RowWatchlist";
import MovieModal from "../../components/MovieModal";
import { useMyContext } from "../../MyContext";
import Footer from "../../components/Footer";
import API from "../../apiConfig";
const Watchlist = () => {
  const { movieDataFromListItem } = useMyContext();
  const [user, setUser] = useState({});
  const { watchlist } = useMyContext();

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

  const [isModalOpenInHome, setIsModalOpenInHome] = useState(false);

  const handleModalOpenChange = (isOpen) => {
    setIsModalOpenInHome(isOpen);
  };

  return (
    <div className="watchlist">
      <Topbar />
      <h1>My List</h1>
      <div className="listItemWrapper">
        {watchlist && watchlist.length > 0 ? (
          <RowWatchlist
            arr={watchlist}
            onModalOpenChange={handleModalOpenChange}
          />
        ) : !watchlist && user && user.favoriteMovies ? (
          <RowWatchlist
            arr={user.favoriteMovies}
            onModalOpenChange={handleModalOpenChange}
          />
        ) : null}
      </div>
      {isModalOpenInHome && (
        <div className="modalWrapper">
          <MovieModal
            onModalOpenChange={handleModalOpenChange}
            movie={JSON.stringify(movieDataFromListItem)}
          />
        </div>
      )}
      <Footer />
    </div>
  );
};
export default Watchlist;
