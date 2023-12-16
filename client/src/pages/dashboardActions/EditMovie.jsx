import React, { useEffect, useState } from "react";
import "./editMovie.scss";
import Sidebar from "../../components/Sidebar";
import { TrashSimple } from "@phosphor-icons/react";
import AdminTopbar from "../../components/AdminTopbar";
import storage from "./firebase"; // Import the Firebase storage instance
import API from "../../apiConfig";
const EditMovie = () => {
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    const getMedia = async () => {
      const hash = window.location.hash;
      const parts = hash.split("/");
      let movieId;
      movieId = parts[4];
      try {
        let url = `${API}/movies/find/${movieId}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setMovie(data);
      } catch (err) {
        console.error(err);
      }
    };
    getMedia();
  }, []);

  const [formData, setFormData] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Updating ${name} with value: ${value}`);
    setFormData({ ...formData, [name]: value });
    console.log(formData);
  };
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e, fileType) => {
    const file = e.target.files[0];

    if (file) {
      setIsUploading(true);
      const storageRef = storage.ref();
      const fileRef = storageRef.child(`movieImages/${file.name}`);

      try {
        await fileRef.put(file);
        const downloadUrl = await fileRef.getDownloadURL();
        setFormData({ ...formData, [fileType]: downloadUrl });
      } catch (error) {
        console.error("Error uploading file to Firebase:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleArrayUpdate = (action, arrayName, newValue, itemToRemove) => {
    console.log(arrayName);
    if (action === "add" && newValue.trim() !== "") {
      const updatedArray = [...movie[arrayName], newValue.trim()];
      setMovie({ ...movie, [arrayName]: updatedArray });
      setFormData({ ...formData, [arrayName]: "" });
    } else if (action === "remove") {
      const updatedArray = movie[arrayName].filter(
        (item) => item !== itemToRemove
      );
      setMovie({ ...movie, [arrayName]: updatedArray });
    }
  };

  const handleUpdateMovie = async () => {
    const savedUserData = localStorage.getItem("userData");
    if (savedUserData && !isUploading) {
      // If user data exists in localStorage, parse it
      const data = JSON.parse(savedUserData);
      const token = data.accessToken;
      try {
        const updatedMovie = { ...movie };
        console.log(updatedMovie);
        // Update all the fields based on formData
        Object.keys(formData).forEach((fieldName) => {
          updatedMovie[fieldName] = formData[fieldName];
        });

        updatedMovie["tags"] = movie.tags;
        updatedMovie["cast"] = movie.cast;
        updatedMovie["genres"] = movie.genres;

        const response = await fetch(`${API}/movies/${movie._id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedMovie),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />
      <AdminTopbar />
      {movie && (
        <div className="container">
          <h2>Edit Movie</h2>
          <form>
            <div className="editMovieFormContainer">
              <div className="leftColumn">
                <div className="formGroup">
                  <label>Title:</label>
                  <input
                    type="text"
                    name="title"
                    placeholder={movie.title}
                    value={formData.title || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="formGroup">
                  <label>Director:</label>
                  <input
                    type="text"
                    name="director"
                    placeholder={movie.director}
                    value={formData.director || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="formGroup">
                  <label>Year:</label>
                  <input
                    type="text"
                    name="releaseDate"
                    placeholder={movie.releaseDate}
                    value={formData.releaseDate || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="formGroup">
                  <label>Limit:</label>
                  <input
                    type="text"
                    name="ageLimit"
                    placeholder={movie.ageLimit}
                    value={formData.ageLimit || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="formGroup">
                  <label>Description:</label>
                  <textarea
                    name="description"
                    placeholder={movie.description}
                    value={formData.description || ""}
                    onChange={handleInputChange}
                    rows={4} //Rows in textaera
                    style={{ width: "280px" }}
                  />
                </div>
                <div className="formGroup">
                  <label>Featured Image:</label>
                  {!formData.imgFeatured ? (
                    <img
                      className="imgFeatured"
                      src={movie.imgFeatured}
                      alt="Featured"
                    />
                  ) : (
                    <img
                      className="imgFeatured"
                      src={formData.imgFeatured}
                      alt="Featured"
                      width="100"
                    />
                  )}
                  <br></br>
                  <input
                    type="file"
                    name="imgFeatured"
                    onChange={(e) => handleFileUpload(e, "imgFeatured")}
                    //passing the event object (e) to the handleFileUpload function along with the string "fileType" as an argument
                  />
                </div>
                <div className="formGroup">
                  <label>Thumbnail Image:</label>
                  {!formData.imgThumbnail ? (
                    <img
                      className="thumbnail"
                      src={movie.imgThumbnail}
                      alt="Thumbnail"
                    />
                  ) : (
                    <img
                      className="thumbnail"
                      src={formData.imgThumbnail}
                      alt="Thumbnail"
                    />
                  )}
                  <br></br>
                  <input
                    type="file"
                    name="imgThumbnail"
                    onChange={(e) => handleFileUpload(e, "imgThumbnail")}
                  />
                </div>
                <div className="formGroup">
                  <label>Title Image:</label>
                  {!formData.imgTitle ? (
                    <img className="title" src={movie.imgTitle} alt="" />
                  ) : (
                    <img className="title" src={formData.imgTitle} alt="" />
                  )}
                  <br></br>
                  <input
                    type="file"
                    name="imgTitle"
                    onChange={(e) => handleFileUpload(e, "imgTTitle")}
                  />
                </div>
                <div className="formGroup">
                  <label>Video:</label>
                  <input
                    type="file"
                    accept="video/*"
                    name="video"
                    onChange={(e) => handleFileUpload(e, "video")}
                  />
                </div>
              </div>

              <div className="rightColumn">
                <div className="formGroup">
                  <span>Click the tag, genre or cast member to remove it.</span>
                  <br></br>
                  <br></br>
                  <label>Tags:</label>
                  <ul>
                    {movie.tags.map((tag, index) => (
                      <li
                        key={index}
                        className="tag"
                        onClick={() =>
                          handleArrayUpdate(
                            "remove",
                            "tags",
                            formData.tags,
                            tag
                          )
                        }
                      >
                        <span>{tag}</span>
                        <TrashSimple className="bin" />
                      </li>
                    ))}
                  </ul>
                  <div className="inputWithButton">
                    <input
                      type="text"
                      name="tags"
                      placeholder="Add Tag"
                      value={formData.tags || ""}
                      onChange={handleInputChange}
                    />
                    <button
                      className="arrayActions"
                      type="button"
                      onClick={() =>
                        handleArrayUpdate("add", "tags", formData.tags)
                      }
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="formGroup">
                  <label>Genres:</label>
                  <ul>
                    {movie.genres.map((genre, index) => (
                      <li
                        key={index}
                        className="genre"
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
                        <TrashSimple className="bin" />
                      </li>
                    ))}
                  </ul>
                  <div className="inputWithButton">
                    <input
                      type="text"
                      name="genres"
                      placeholder="Add Tag"
                      value={formData.genres || ""}
                      onChange={handleInputChange}
                    />
                    <button
                      className="arrayActions"
                      type="button"
                      onClick={() =>
                        handleArrayUpdate("add", "genres", formData.genres)
                      }
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="formGroup">
                  <label>Cast:</label>
                  <ul>
                    {movie.cast.map((actor, index) => (
                      <li
                        key={index}
                        className="actor"
                        onClick={() =>
                          handleArrayUpdate(
                            "remove",
                            "cast",
                            formData.cast,
                            actor
                          )
                        }
                      >
                        <span>{actor}</span>
                        <TrashSimple className="bin" />
                      </li>
                    ))}
                  </ul>
                  <div className="inputWithButton">
                    <input
                      type="text"
                      name="cast"
                      placeholder="Add Actor"
                      value={formData.cast || ""}
                      onChange={handleInputChange}
                    />
                    <button
                      className="arrayActions"
                      type="button"
                      onClick={() =>
                        handleArrayUpdate("add", "cast", formData.cast)
                      }
                    >
                      Add
                    </button>
                  </div>
                </div>
                {/*
                  <div className="formGroup">
                    <label>Trailer video:</label>
                      <input
                        type="file"
                        accept="video/*"
                        name="videoTrailer"
                        onChange={(e) => handleFileUpload(e, 'videoTrailer')}
                      />
                    </div>
                */}
              </div>
            </div>
          </form>
          <button className="addMovie" onClick={handleUpdateMovie}>
            Update Movie
          </button>
        </div>
      )}
    </div>
  );
};

export default EditMovie;
