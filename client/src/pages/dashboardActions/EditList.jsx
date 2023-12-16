import React, { useEffect, useState } from "react";
import API from "../../apiConfig";
import "../dashboard/dashboard.scss";
import "./editList.scss";
import Sidebar from "../../components/Sidebar";
import { TrashSimple } from "@phosphor-icons/react";
import AdminTopbar from "../../components/AdminTopbar";
const EditList = () => {
  const [formData, setFormData] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    //console.log(`Updating ${name} with value: ${value}`);
    setFormData({ ...formData, [name]: value });
    //console.log(formData);
  };

  const [list, setList] = useState(null);

  useEffect(() => {
    const getMedia = async () => {
      const hash = window.location.hash;
      const parts = hash.split("/");

      let listId;
      if (parts.length >= 3 && parts[2] === "edit") {
        listId = parts[3];
      }
      try {
        let url = `${API}/lists/find/${listId}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setList(data);
      } catch (err) {
        console.error(err);
      }
    };

    getMedia();
  }, []);

  const [searchResults, setSearchResults] = useState([]); // Added state for search results
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchMovies = async () => {
    try {
      const response = await fetch(`${API}/movies/search?query=${searchQuery}`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const searchResultsData = await response.json();

      // Filter out movies that are already in the content
      const filteredResults = searchResultsData.filter((movie) => {
        return !list.content.some(
          (contentMovie) => contentMovie._id === movie._id
        );
      });
      setSearchResults(filteredResults);
    } catch (err) {
      console.error(err);
    }
  };
  const handleDeleteFromContent = (movieId) => {
    // Filter out the movie with the specified ID and update the content state
    const deletedMovie = list.content.find((movie) => movie._id === movieId);

    // Update the list content by removing the deleted movie
    setList((prevList) => ({
      ...prevList,
      content: prevList.content.filter((movie) => movie._id !== movieId),
    }));

    setSearchResults((prevSearchResults) => [
      ...prevSearchResults,
      deletedMovie,
    ]);
  };

  const handleAddMovieToContent = (movie) => {
    // Check if the movie is already in the content
    if (!list.content.some((contentMovie) => contentMovie._id === movie._id)) {
      // Add the movie to the content
      setList((prevList) => ({
        ...prevList,
        content: [...prevList.content, movie],
      }));
      setSearchResults((prevSearchResults) =>
        prevSearchResults.filter((result) => result._id !== movie._id)
      );

      setSearchQuery(""); // Clear the search query
    }
  };

  const handleUpdateList = async () => {
    const hash = window.location.hash;
    const parts = hash.split("/");
    let listId;
    if (parts.length >= 3 && parts[2] === "edit") {
      listId = parts[3];
    }

    // Include the updated title in the formData
    const updatedListData = {
      ...list,
      title: formData.title,
    };

    const savedUserData = localStorage.getItem("userData");

    if (savedUserData) {
      const data = JSON.parse(savedUserData);
      const token = data.accessToken;

      try {
        const response = await fetch(`${API}/lists/${listId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedListData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        // Assuming the response contains the updated list data
        const updatedList = await response.json();
        // Update the state with the updated list data
        setList(updatedList);
      } catch (error) {
        console.error(`Error updating list: ${error.message}`);
      }
    }
  };

  const handleArrayUpdate = (action, arrayName, newValue, itemToRemove) => {
    if (action === "add" && newValue.trim() !== "") {
      const updatedArray = [...list[arrayName], newValue.trim()];
      setList({ ...list, [arrayName]: updatedArray });
      setFormData({ ...formData, [arrayName]: "" });
    } else if (action === "remove") {
      const updatedArray = list[arrayName].filter(
        (item) => item !== itemToRemove
      );
      setList({ ...list, [arrayName]: updatedArray });
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <AdminTopbar />
      <div className="container">
        <h2>Edit List</h2>
        <form>
          <div className="editListFormContainer">
            <div className="formGroup">
              <label>Title:</label>
              <input
                type="text"
                name="title"
                placeholder="List Title"
                value={formData.title || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="formGroup">
              {list && list.genres && list.genres.length > 0 && (
                <>
                  <label>Genres:</label>
                  <ul>
                    {list.genres.map((genre, index) => (
                      <li
                        key={index}
                        className="genres"
                        onClick={() =>
                          handleArrayUpdate(
                            "remove",
                            "genres",
                            formData.genres,
                            genre
                          )
                        }
                      >
                        <span>{genre}</span>
                        <TrashSimple className="bin" size={16} />
                      </li>
                    ))}
                  </ul>
                  <input
                    type="text"
                    name="genre"
                    placeholder="Add Genre"
                    value={formData.genre || ""}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    className="arrayActions"
                    onClick={() =>
                      handleArrayUpdate("add", "genres", formData.genre)
                    }
                  >
                    Add
                  </button>
                </>
              )}
            </div>

            {list && list.content && list.content.length > 0 && (
              <div className="formGroup">
                <div className="itemsTable">
                  <label>Content:</label>
                  <table>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Release</th>
                        <th>Genres</th>
                        <th>Tags</th>
                        <th>Limit</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.content.map((movie) => (
                        <tr key={movie._id}>
                          <td className="title-cell">
                            <img
                              src={movie.imgFeatured}
                              alt={`Thumbnail for ${movie.title}`}
                            />
                            <div className="title-text">{movie.title}</div>
                          </td>
                          <td>{movie.releaseDate}</td>
                          <td>{movie.genres.join(", ")}</td>
                          <td>{movie.tags.join(", ")}</td>
                          <td>{movie.ageLimit}</td>

                          <td>
                            <TrashSimple
                              className="bin"
                              onClick={() => handleDeleteFromContent(movie._id)}
                              size={22}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <br></br>
                <input
                  type="text"
                  name="movie"
                  placeholder="Search for a Movie"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleSearchMovies}
                  className="arrayActions"
                >
                  Search
                </button>
                <ul>
                  {" "}
                  {searchResults.length > 0 && (
                    <div className="itemsTable">
                      <table>
                        <thead>
                          <tr>
                            <th>Title</th>
                            <th>Release</th>
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
                              <td>{movie.genres.join(", ")}</td>
                              <td>{movie.tags.join(", ")}</td>
                              <td>{movie.ageLimit}</td>
                              <td>
                                {" "}
                                <button
                                  type="button"
                                  className="arrayActions"
                                  onClick={() => handleAddMovieToContent(movie)}
                                >
                                  Add
                                </button>{" "}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </ul>
              </div>
            )}
          </div>
          <button type="button" className="editList" onClick={handleUpdateList}>
            Edit List
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditList;
