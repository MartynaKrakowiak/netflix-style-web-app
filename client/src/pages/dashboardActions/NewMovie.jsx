import React, { useState } from "react";
import "../dashboard/dashboard.scss";
import "./newMovie.scss";
import Sidebar from "../../components/Sidebar";
import storage from "./firebase"; // Import the Firebase storage instance
import { TrashSimple, ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import AdminTopbar from "../../components/AdminTopbar";
import API from "../../apiConfig";
const NewMovie = () => {
  const [formData, setFormData] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Updating ${name} with value: ${value}`);
    setFormData({ ...formData, [name]: value });
  };

  const handleFileUpload = async (e, fileType) => {
    const file = e.target.files[0];

    if (file) {
      setIsUploading(true);
      const storageRef = storage.ref();
      const originalFileName = file.name;
      const shortenedFileName = originalFileName.slice(0, 10); // Get the first 10 characters of the file name
      const fileRef = storageRef.child(`movieImages/${shortenedFileName}`);

      try {
        await fileRef.put(file);
        const downloadUrl = await fileRef.getDownloadURL();
        setFormData({
          ...formData,
          [fileType]: downloadUrl,
          [`${fileType}Name`]: shortenedFileName,
        });
      } catch (error) {
        console.error("Error uploading file to Firebase:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState([]);

  const handleAddTags = () => {
    if (newTag.trim() !== "") {
      // Add the new tag to the list of tags
      setTags([...tags, newTag.trim()]);
      setNewTag(""); // Clear the input field
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const updatedTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(updatedTags);
  };

  const [newGenre, setNewGenre] = useState("");
  const [genres, setGenres] = useState([]);
  const handleAddGenres = () => {
    if (newGenre.trim() !== "") {
      // Add the new tag to the list of tags
      setGenres([...genres, newGenre.trim()]);
      setNewGenre(""); // Clear the input field
    }
  };

  const handleRemoveGenre = (genreToRemove) => {
    const updatedGenres = genres.filter((genre) => genre !== genreToRemove);
    setGenres(updatedGenres);
  };

  const [newActor, setNewActor] = useState("");
  const [actors, setActors] = useState([]);

  const handleAddActors = () => {
    if (newActor.trim() !== "") {
      // Add the new tag to the list of tags
      setActors([...actors, newActor.trim()]);
      setNewActor(""); // Clear the input field
    }
  };

  const handleRemoveActor = (actorToRemove) => {
    const updatedCast = actors.filter((actor) => actor !== actorToRemove);
    setActors(updatedCast);
  };

  const handleAddNewMovie = async () => {
    const savedUserData = localStorage.getItem("userData");

    if (savedUserData) {
      // If user data exists in localStorage, parse it
      const data = JSON.parse(savedUserData);
      const token = data.accessToken;

      try {
        // Create a new movie object from the formData
        const newMovie = {
          title: formData.title,
          director: formData.director,
          releaseDate: formData.releaseDate,
          ageLimit: formData.ageLimit,
          description: formData.description,
          imgFeatured: formData.imgFeatured,
          imgThumbnail: formData.imgThumbnail,
          imgTitle: formData.imgTitle,
          video: formData.video,
          cast: actors,
          genres: genres,
          tags: tags,
        };

        const savedUserData = localStorage.getItem("userData");

        if (savedUserData) {
          const data = JSON.parse(savedUserData);
          const token = data.accessToken;

          const response = await fetch(`${API}/movies`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newMovie),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const addedMovieData = await response.json();
          // Handle the added movie data as needed
          console.log("Added Movie:", addedMovieData);

          // Clear the form data after successful addition
          setFormData({});
          setActors([]);
          setGenres([]);
          setTags([]);
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
      <div className="container">
        <h2>New Movie</h2>
        <form>
          <div className="newMovieFormContainer">
            <div className="leftColumn">
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
                <label>Director:</label>
                <input
                  type="text"
                  name="director"
                  placeholder="Enter Director"
                  value={formData.director || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="formGroup">
                <label>Year:</label>
                <input
                  type="text"
                  name="releaseDate"
                  placeholder="Enter Year"
                  value={formData.releaseDate || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="formGroup">
                <label>Limit:</label>
                <input
                  type="text"
                  name="ageLimit"
                  placeholder="Enter Limit"
                  value={formData.ageLimit || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="formGroup">
                <label>Description:</label>
                <textarea
                  name="description"
                  placeholder="Enter Description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  rows={4}
                  style={{ width: "280px" }}
                />
              </div>
              <div className="formGroup">
                <label>Featured Image:</label>
                {formData.imgFeatured && (
                  <img
                    className="imgFeatured"
                    src={formData.imgFeatured}
                    alt="Featured"
                    width="100"
                  />
                )}
                <input
                  type="file"
                  name="imgFeatured"
                  onChange={(e) => handleFileUpload(e, "imgFeatured")}
                />
              </div>
              <div className="formGroup">
                <label>Thumbnail Image:</label>
                {formData.imgThumbnail && (
                  <img
                    className="thumbnail"
                    src={formData.imgThumbnail}
                    alt="Thumbnail"
                  />
                )}
                <input
                  type="file"
                  name="imgThumbnail"
                  onChange={(e) => handleFileUpload(e, "imgThumbnail")}
                />
              </div>
              <div className="formGroup">
                <label>Title Image:</label>
                {formData.imgTitle && (
                  <img className="title" src={formData.imgTitle} alt="Title" />
                )}
                <input
                  type="file"
                  name="imgTitle"
                  onChange={(e) => handleFileUpload(e, "imgTitle")}
                />
              </div>
              {/*
                    <div className="formGroup">
                        <label>Trailer video:</label>
                            <input
                                type="file"
                                accept="video/*" // Specify the accepted file types (in this case, any video type)
                                name="videoTrailer"
                                onChange={(e) => handleFileUpload(e, 'videoTrailer')}
                            />
                    </div>
                */}
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
                <span>
                  Click the tag, genre or cast member to remove it. <br></br>
                  <br></br>
                </span>

                <label>Tags:</label>
                <ul>
                  {tags.map((tag, index) => (
                    <li
                      key={index}
                      className="tag"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      <span>{tag}</span> <TrashSimple className="bin" />
                    </li>
                  ))}
                </ul>
                <div className="inputWithButton">
                  <input
                    type="text"
                    name="tags"
                    placeholder="Add Tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                  />
                  <button
                    className="arrayActions"
                    type="button"
                    onClick={handleAddTags}
                  >
                    Add
                  </button>
                </div>
              </div>
              <div className="formGroup">
                <label>Genres:</label>
                <ul>
                  {genres.map((genre, index) => (
                    <li
                      key={index}
                      className="genre"
                      onClick={() => handleRemoveGenre(genre)}
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
                    placeholder="Add Genre"
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                  />
                  <button
                    className="arrayActions"
                    type="button"
                    onClick={handleAddGenres}
                  >
                    Add
                  </button>
                </div>
              </div>
              <div className="formGroup">
                <label>Cast:</label>
                <ul>
                  {actors.map((actor, index) => (
                    <li
                      key={index}
                      className="actor"
                      onClick={() => handleRemoveActor(actor)}
                    >
                      <span>{actor}</span>
                      <TrashSimple className="bin" />
                    </li>
                  ))}
                </ul>
                <div className="inputWithButton">
                  <input
                    type="text"
                    name="actors"
                    placeholder="Add Actor"
                    value={newActor}
                    onChange={(e) => setNewActor(e.target.value)}
                  />
                  <button
                    className="arrayActions"
                    type="button"
                    onClick={handleAddActors}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
        <button className="addMovie" onClick={handleAddNewMovie}>
          Add Movie
        </button>
      </div>
    </div>
  );
};

export default NewMovie;
