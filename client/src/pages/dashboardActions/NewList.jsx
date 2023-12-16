import React, { useEffect, useState } from "react";
import "../dashboard/dashboard.scss";
import "./newList.scss";
import Sidebar from "../../components/Sidebar";
import { TrashSimple } from "@phosphor-icons/react";
import AdminTopbar from "../../components/AdminTopbar";
import API from "../../apiConfig";
const NewList = () => {
  const [formData, setFormData] = useState({});
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Updating ${name} with value: ${value}`);
    setFormData({ ...formData, [name]: value });
  };

  const [newGenre, setNewGenre] = useState("");
  const [genres, setGenres] = useState([]);

  const handleGenres = (action, value) => {
    if (action === "add") {
      if (value.trim() !== "") {
        setGenres([...genres, value.trim()]);
        setNewGenre(""); // Clear the input field
      }
    } else if (action === "remove") {
      const updatedGenres = genres.filter((genre) => genre !== value);
      setGenres(updatedGenres);
    }
  };

  const [searchQuery, setSearchQuery] = useState(""); // Added state for search query
  const [searchResults, setSearchResults] = useState([]); // Added state for search results
  const [content, setContent] = useState([]);
  const [deletedMovies, setDeletedMovies] = useState([]);
  const handleSearchMovies = async () => {
    try {
      const movieResponse = await fetch(
        `${API}/movies/search?query=${searchQuery}`
      );
      if (!movieResponse.ok) {
        throw new Error(`HTTP error! Status: ${movieResponse.status}`);
      }
      const movieSearchResults = await movieResponse.json();

      const seriesResponse = await fetch(
        `${API}/series/search?query=${searchQuery}`
      );
      if (!seriesResponse.ok) {
        throw new Error(`HTTP error! Status: ${seriesResponse.status}`);
      }
      const seriesSearchResults = await seriesResponse.json();

      // Filter out movies that are already in the content
      const filteredMovieResults = movieSearchResults.filter((movie) => {
        return !content.some((contentMovie) => contentMovie._id === movie._id);
      });

      // Filter out series that are already in the content
      const filteredSeriesResults = seriesSearchResults.filter((series) => {
        return !content.some(
          (contentSeries) => contentSeries._id === series._id
        );
      });

      // Merge the results from movies and series
      const mergedSearchResults = [
        ...filteredMovieResults,
        ...filteredSeriesResults,
        ...deletedMovies,
      ];

      setSearchResults(mergedSearchResults);
      console.log(mergedSearchResults);
    } catch (err) {
      console.error(err);
    }
  };

  // Function to add a selected movie to content
  const handleAddMovieToContent = (movie) => {
    // Check if the movie is already in the content
    if (!content.some((contentMovie) => contentMovie._id === movie._id)) {
      // Add the movie to the content
      setContent([...content, movie]);

      // Remove the added movie from the search results
      setSearchResults((prevSearchResults) =>
        prevSearchResults.filter((result) => result._id !== movie._id)
      );

      setSearchQuery(""); // Clear the search query
    }
  };

  const handleDeleteFromContent = (movieId) => {
    // Filter out the movie with the specified ID and update the content state
    const deletedMovie = content.find((movie) => movie._id === movieId);

    if (deletedMovie) {
      setDeletedMovies((prevDeletedMovies) => [
        ...prevDeletedMovies,
        deletedMovie,
      ]);
    }
    setContent((prevContent) =>
      prevContent.filter((movie) => movie._id !== movieId)
    );

    // Add the deleted movie back to the search results immediately
    setSearchResults((prevSearchResults) => [
      ...prevSearchResults,
      deletedMovie,
    ]);
  };

  const handleAddNewList = async () => {
    try {
      // Create a new list object from the formData
      const newList = {
        title: formData.title,
        genres: genres,
        content: content, // Use the content state
      };
      const savedUserData = localStorage.getItem("userData");

      if (savedUserData) {
        const data = JSON.parse(savedUserData);
        const token = data.accessToken;
        const response = await fetch(`${API}/lists/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newList),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const addedListData = await response.json();
        //console.log("Added List:", addedListData);
        // Clear the form data after successful addition
        setFormData({});
        setGenres([]);
        setContent([]);
        setSearchResults("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <AdminTopbar />
      <div className="container">
        <h2>New List</h2>
        <form>
          <div className="newListFormContainer">
            <div className="formGroup">
              <label>Title:</label>
              <input
                type="text"
                name="title"
                placeholder="Enter Title"
                value={formData.title || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="formGroup">
              <label>Genres:</label>
              <ul>
                {genres.map((genre, index) => (
                  <li
                    key={index}
                    className="genre"
                    onClick={() => handleGenres("remove", genre)}
                  >
                    <span>{genre}</span>
                    <TrashSimple className="bin" />
                  </li>
                ))}
              </ul>
              <input
                type="text"
                name="genres"
                placeholder="Add Genre"
                value={newGenre}
                onChange={(e) => setNewGenre(e.target.value)}
              />
              <button
                className="arrayActions"
                type="button"
                onClick={() => handleGenres("add", newGenre)}
              >
                Add
              </button>
            </div>
            <div className="formGroup">
              <label>Added content:</label>

              <div className="itemsTable">
                <table>
                  <thead>
                    {content && content.length > 0 && (
                      <tr>
                        <th>Title</th>
                        <th>Release</th>
                        <th>Director</th>
                        <th>Genres</th>
                        <th>Tags</th>
                        <th>Limit</th>
                        <th>Actions</th>
                      </tr>
                    )}
                  </thead>

                  <tbody>
                    {content.map((movie) => (
                      <tr key={movie._id}>
                        <td className="title-cell">
                          <img
                            src={movie.imgFeatured}
                            alt={`Thumbnail for ${movie.title}`}
                          />
                          <div className="title-text">{movie.title}</div>
                        </td>
                        <td>{movie.releaseDate}</td>
                        <td>{movie.director}</td>
                        <td>{movie.genres.join(", ")}</td>
                        <td>{movie.tags.join(", ")}</td>
                        <td>{movie.ageLimit}</td>
                        <td>
                          <TrashSimple
                            onClick={() => handleDeleteFromContent(movie._id)}
                            size={22}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <input
                type="text"
                name="movie"
                placeholder="Search for a Movie"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="button"
                className="arrayActions"
                onClick={handleSearchMovies}
              >
                Search
              </button>

              {searchResults.length > 0 && (
                <div className="itemsTable">
                  <br></br>
                  <label>Search results:</label>
                  <br></br>
                  <table>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Release</th>
                        <th>Director</th>
                        <th>Genres</th>
                        <th>Tags</th>
                        <th>Limit</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.map((movie) => (
                        <tr key={movie._id}>
                          <td className="title-cell">
                            <img
                              src={movie.imgFeatured}
                              alt={`Thumbnail for ${movie.title}`}
                            />
                            <div className="title-text">{movie.title}</div>
                          </td>
                          <td>{movie.releaseDate}</td>
                          <td>{movie.director}</td>
                          <td>{movie.genres.join(", ")}</td>
                          <td>{movie.tags.join(", ")}</td>
                          <td>{movie.ageLimit}</td>
                          <td>
                            <div className="buttons">
                              <button
                                className="arrayActions"
                                type="button"
                                onClick={() => handleAddMovieToContent(movie)}
                              >
                                Add
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          <button type="button" className="addList" onClick={handleAddNewList}>
            Add List
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewList;
