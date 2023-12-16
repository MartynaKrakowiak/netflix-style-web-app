import React, { useState, useEffect } from "react";
import { TrashSimple } from "@phosphor-icons/react";
import "./newSeries.scss";
import Sidebar from "../../components/Sidebar";
import storage from "./firebase"; // Import the Firebase storage instance
import AdminTopbar from "../../components/AdminTopbar";
import API from "../../apiConfig";
const NewSeries = () => {
  const [formData, setFormData] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    //console.log(`Updating ${name} with value: ${value}`);
    setFormData({ ...formData, [name]: value });
  };

  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e, fileType) => {
    const file = e.target.files[0];

    if (file) {
      setIsUploading(true);
      const storageRef = storage.ref();
      const fileRef = storageRef.child(`seriesImages/${file.name}`);

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

  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState([]);

  const handleAddTags = () => {
    if (newTag.trim() !== "") {
      // Add the new tag to the list of tags
      setTags([...tags, newTag.trim()]);
      setNewTag(""); // Clear the input field
      setFormData({ ...formData, tags: [...tags, newTag.trim()] }); // Update formData
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
      // Add the new genre to the list of genres
      setGenres([...genres, newGenre.trim()]);
      setNewGenre(""); // Clear the input field
      setFormData({ ...formData, genres: [...genres, newGenre.trim()] }); // Update formData
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
      // Add the new actor to the list of actors
      setActors([...actors, newActor.trim()]);
      setNewActor(""); // Clear the input field
      setFormData({ ...formData, actors: [...actors, newActor.trim()] }); // Update formData
    }
  };

  const handleRemoveActor = (actorToRemove) => {
    const updatedCast = actors.filter((actor) => actor !== actorToRemove);
    setActors(updatedCast);
  };

  const [isSeasonAdded, setIsSeasonAdded] = useState(false); // Track if a season has been added
  const [seasons, setSeasons] = useState([]);
  const [newSeason, setNewSeason] = useState({});
  const [showEpisodeFields, setShowEpisodeFields] = useState(false); // Show episode fields when adding a season
  const [newEpisode, setNewEpisode] = useState({});
  const [currentSeason, setCurrentSeason] = useState(null);
  const handleAddEpisode = () => {
    if (
      newEpisode &&
      newEpisode.episodeTitle &&
      newEpisode.episodeDescription &&
      newEpisode.episodeThumbnail
    ) {
      const updatedSeasons = [...seasons];
      const lastSeasonIndex = updatedSeasons.length - 1;
      const episodeToAdd = {
        title: newEpisode.episodeTitle,
        description: newEpisode.episodeDescription,
        thumbnail: newEpisode.episodeThumbnail,
        video: newEpisode.episodeVideo,
        tags: tags,
        cast: actors,
        genres: genres,
      };

      updatedSeasons[lastSeasonIndex].episodes.push(episodeToAdd);
      setSeasons(updatedSeasons);
      setNewEpisode({}); // Clear the episode fields after adding
      episodeThumbnailInputRef.current.value = "";
      episodeVideoInputRef.current.value = "";
    }
  };

  const handleAddSeason = () => {
    // Calculate the next season number
    const nextSeasonNumber =
      seasons.length === 0 ? 1 : seasons[seasons.length - 1].seasonNumber + 1;

    const currentSeasonNumber = nextSeasonNumber - 1;
    setCurrentSeason(currentSeasonNumber);

    setSeasons([...seasons, { seasonNumber: nextSeasonNumber, episodes: [] }]);
    setNewSeason({});
    setShowEpisodeFields(true); // Show episode fields after adding a season
    setIsSeasonAdded(true);
  };

  const handleEpisodeFileUpload = async (e, fileType) => {
    const file = e.target.files[0];

    if (file) {
      setIsUploading(true);
      const storageRef = storage.ref();
      const fileRef = storageRef.child(`seriesImages/${file.name}`);

      try {
        await fileRef.put(file);
        const downloadUrl = await fileRef.getDownloadURL();
        setNewEpisode({ ...newEpisode, [fileType]: downloadUrl });
      } catch (error) {
        console.error("Error uploading file to Firebase:", error);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleAddNewSeries = async () => {

    const savedUserData = localStorage.getItem("userData");

    if (savedUserData) {
      // If user data exists in localStorage, parse it
      const data = JSON.parse(savedUserData);
      const token = data.accessToken;

      try {
        const newSeriesData = { ...formData, seasons };
        //console.log(newSeriesData)
        const response = await fetch(`${API}/series`, {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newSeriesData),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };
  const episodeThumbnailInputRef = React.createRef();
  const episodeVideoInputRef = React.createRef();
  return (
    <div className="dashboard">
      <Sidebar />
      <AdminTopbar />
      <div className="container">
        <h2>New Series</h2>
        <form>
          <div className="newSeriesFormContainer">
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
            </div>
            <div className="rightColumn">
              <div className="formGroup">
                <span>Click the tag, genre or cast member to remove it.</span>
                <br></br>
                <br></br>

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
              <span>
                To add a new season to a TV series, click this button.
              </span>
              <br></br>
              <br></br>
              <button
                type="button"
                className="addSeasonButton"
                onClick={handleAddSeason}
              >
                Add Season
              </button>
              <br></br>
              <br></br>
              <span>Added seasons:</span>
              <br></br>
              <br></br>
              <div className="formGroup">
                {seasons.map((season, index) => (
                  <div key={index} className="season">
                    <span className="nSeason">
                      Season {season.seasonNumber}
                    </span>
                    <br></br>
                    <br></br>
                    <ul>
                      {season.episodes.map((episode, episodeIndex) => (
                        <li className="episodeDetails" key={episodeIndex}>
                          <span>
                            <b>Episode {episodeIndex + 1}</b>: {episode.title}
                          </span>
                          <textarea
                            className="episodeDescription"
                            value={episode.description}
                          />
                          <img
                            className="episodeThumbnail"
                            src={episode.thumbnail}
                            alt=""
                          />
                          <br></br>
                        </li>
                      ))}
                      {showEpisodeFields &&
                        currentSeason + 1 === season.seasonNumber && (
                          <div className="episodeFormContainer">
                            <span>Add new episode:</span>
                            <br></br>
                            <br></br>
                            <input
                              type="text"
                              name="episodeTitle"
                              placeholder="Episode Title"
                              value={newEpisode.episodeTitle || ""}
                              onChange={(e) =>
                                setNewEpisode({
                                  ...newEpisode,
                                  episodeTitle: e.target.value,
                                })
                              }
                            />
                            <br></br>
                            <br></br>
                            <textarea
                              name="episodeDescription"
                              placeholder="Episode Description"
                              value={newEpisode.episodeDescription || ""}
                              onChange={(e) =>
                                setNewEpisode({
                                  ...newEpisode,
                                  episodeDescription: e.target.value,
                                })
                              }
                              rows={4}
                              style={{ width: "280px" }}
                            />
                            <br></br>
                            <br></br>
                            <label>Episode Thumbnail:</label>
                            <input
                              type="file"
                              name="episodeThumbnail"
                              placeholder="Episode Thumbnail"
                              ref={episodeThumbnailInputRef}
                              onChange={(e) =>
                                handleEpisodeFileUpload(e, "episodeThumbnail")
                              }
                            />

                            {newEpisode.episodeThumbnail && (
                              <img
                                className="episodeThumbnail"
                                src={newEpisode.episodeThumbnail}
                                alt=""
                              />
                            )}
                            <br></br>
                            <label>Episode Video:</label>
                            <input
                              type="file"
                              name="episodeVideo"
                              placeholder="Episode Video"
                              ref={episodeVideoInputRef}
                              accept="video/*"
                              onChange={(e) =>
                                handleEpisodeFileUpload(e, "episodeVideo")
                              }
                            />

                            <button
                              className="arrayActions"
                              type="button"
                              onClick={handleAddEpisode}
                            >
                              Add
                            </button>
                            <br></br>
                          </div>
                        )}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
        <button className="addMovie" onClick={handleAddNewSeries}>
          Add Series
        </button>
      </div>
    </div>
  );
};

export default NewSeries;
