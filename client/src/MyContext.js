import React, { createContext, useContext, useState } from "react";
import API from "./apiConfig";
const MyContext = createContext();

function MyProvider({ children }) {
  const [movieDataFromListItem, setmovieDataFromListItem] = useState(null);
  const [isSearchbarActive, setIsSearchbarActive] = useState(false);
  const [searchbarQuery, setSearchbarQuery] = useState("");
  const [listItemCoords, setListItemCoords] = useState({ left: 0, top: 0 });
  const [movieDataFromFeatured, setmovieDataFromFeatured] = useState(null);
  const [selectListGenre, setSelectListGenre] = useState(null);
  const [loginUser, setLoginUser] = useState(null);
  
  const updatemovieDataFromFeatured = (data) => {
    setmovieDataFromFeatured(data);
  };

  const updateListItemCoords = (data) => {
    setListItemCoords(data);
  };

  const updateIsSearchbarActive = (data) => {
    setIsSearchbarActive(data);
  };

  const updateSearchbarQuery = (data) => {
    setSearchbarQuery(data);
  };

  const updateData = (data) => {
    setmovieDataFromListItem(data);
  };

  const updateSelectListGenre = (data) => {
    setSelectListGenre(data);
  };

  const updateLoginUser = (data) => {
    setLoginUser(data);
  };

  const [watchlist, setWatchlist] = useState(); // Initialize with an empty array

  const addToWatchlist = async (item) => {
    const storedUserData = localStorage.getItem("userData");
    const usr = JSON.parse(storedUserData);

    try {
      const userUrl = `${API}/users/find/${usr._id}`;

      // Fetch the user data
      const userResponse = await fetch(userUrl);
      const userData = await userResponse.json();

      // Update the favorite movies
      const updatedFavoriteMovies = [item, ...userData.favoriteMovies];

      // Update the state (assuming setWatchlist is a state updater function)
      setWatchlist(updatedFavoriteMovies);

      // Create the updated user object
      const updatedUser = {
        ...userData,
        favoriteMovies: updatedFavoriteMovies,
      };

      // Make the API request to update the user object in the database
      try {
        const updateUserResponse = await fetch(`${API}/users/${usr._id}`, {
          method: "PUT",
          body: JSON.stringify(updatedUser),
          headers: {
            "Content-Type": "application/json",
          },
        });
        //console.log("add", usr)
        // Handle the response if needed
        const updatedUserData = await updateUserResponse.json();
        // console.log('Updated user data:', updatedUserData);
      } catch (error) {
        console.error("Error updating item in watchlist:", error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const removeFromWatchlist = async (movieToRemoveIndex) => {
    const storedUserData = localStorage.getItem("userData");
    const usr = JSON.parse(storedUserData);
    try {
      let url = `${API}/users/find/${usr._id}`;

      const ress = await fetch(url);
      const data = await ress.json();

      // Use filter to create a new array excluding the movie with the specified index
      const updatedFavoriteMovies = data.favoriteMovies.filter(
        (item) => item !== movieToRemoveIndex
      );
      // console.log(movieToRemoveIndex)
      setWatchlist(updatedFavoriteMovies);

      const updatedUser = { ...data, favoriteMovies: updatedFavoriteMovies };

      try {
        const response = await fetch(`${API}/users/${usr._id}`, {
          method: "PUT", // Use PUT for updating an existing item
          body: JSON.stringify(updatedUser),
          headers: {
            "Content-Type": "application/json",
          },
        });

        // Handle the response as needed
      } catch (error) {
        console.error("Error updating item in watchlist:", error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Method to authenticate the user
  const authenticateUser = async (email, password) => {
    try {
      // Define the URL of your server's login endpoint
      const loginUrl = `${API}/users/login`;

      // Create an object with the user's email and password
      const loginData = {
        email: email,
        password: password,
      };

      // Make a POST request to the login endpoint
      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (response.ok) {
        // Login was successful, handle the response (e.g., get user data)
        const userData = await response.json();
        localStorage.setItem("userData", JSON.stringify(userData));
        return userData;
      } else {
        // Login failed, handle the error response (e.g., display an error message)
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      // Handle any network or unexpected errors
      throw error;
    }
  };

  return (
    <MyContext.Provider
      value={{
        selectListGenre,
        updateSelectListGenre,
        authenticateUser,
        movieDataFromFeatured,
        updatemovieDataFromFeatured,
        movieDataFromListItem,
        updateData,
        watchlist,
        addToWatchlist,
        setWatchlist,
        removeFromWatchlist,
        isSearchbarActive,
        updateIsSearchbarActive,
        searchbarQuery,
        updateSearchbarQuery,
        listItemCoords,
        updateListItemCoords,
        loginUser,
        updateLoginUser,
      }}
    >
      {children}
    </MyContext.Provider>
  );
}

function useMyContext() {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error("useMyContext must be used within a MyProvider");
  }
  return context;
}

export { MyProvider, useMyContext };
