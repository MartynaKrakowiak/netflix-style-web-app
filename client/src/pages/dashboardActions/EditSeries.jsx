import React, { useEffect, useState } from "react";
import "./editSeries.scss";
import Sidebar from "../../components/Sidebar";
import { TrashSimple } from "@phosphor-icons/react";
import storage from "./firebase"; // Import the Firebase storage instance
import AdminTopbar from "../../components/AdminTopbar";
import API from "../../apiConfig";
const EditSeries = () => {
  const [series, setSeries] = useState(null);

  useEffect(() => {
    const getMedia = async () => {
      const hash = window.location.hash;
      const parts = hash.split("/");
      let seriesId;
      seriesId = parts[4];

      try {
        let url = `${API}/series/find/${seriesId}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setSeries(data);
      } catch (err) {
        console.error(err);
      }
    };

    getMedia();
  }, []);

  const [formData, setFormData] = useState({});
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // console.log(`Updating ${name} with value: ${value}`);
    setFormData({ ...formData, [name]: value });
    // console.log(formData)
  };

  const [isUploading, setIsUploading] = useState(false);
  const handleFileUpload = async (e, fileType, targetObject) => {
    const file = e.target.files[0];

    if (file) {
      setIsUploading(true);
      const storageRef = storage.ref();
      const fileRef = storageRef.child(`seriesImages/${file.name}`);

      try {
        await fileRef.put(file);
        const downloadUrl = await fileRef.getDownloadURL();

        // Update the specified target object with the download URL
        targetObject[fileType] = downloadUrl;
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
      const updatedArray = [...series[arrayName], newValue.trim()];
      setSeries({ ...series, [arrayName]: updatedArray });
      setFormData({ ...formData, [arrayName]: "" });
    } else if (action === "remove") {
      const updatedArray = series[arrayName].filter(
        (item) => item !== itemToRemove
      );
      setSeries({ ...series, [arrayName]: updatedArray });
    }
  };

  const [selectedSeason, setSelectedSeason] = useState("1");
  const [selectedEpisodeId, setSelectedEpisodeId] = useState(null);
  const [selectedEpisode, setSelectedEpisode] = useState({});

  const handleUpdateSeries = async () => {
    const savedUserData = localStorage.getItem("userData");
    if (savedUserData && !isUploading) {
      // If user data exists in localStorage, parse it
      const data = JSON.parse(savedUserData);
      const token = data.accessToken;
      try {
        console.log(series);
        const updatedSeries = { ...series };
        console.log(updatedSeries);
        // Update all the fields based on formData
        Object.keys(formData).forEach((fieldName) => {
          updatedSeries[fieldName] = formData[fieldName];
        });

        updatedSeries["tags"] = series.tags;
        updatedSeries["cast"] = series.cast;
        updatedSeries["genres"] = series.genres;

        delete updatedSeries.seasons;
        const response = await fetch(`${API}/series/${updatedSeries._id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,

            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedSeries),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleUpdateEpisode = async () => {
    const savedUserData = localStorage.getItem("userData");

    if (savedUserData) {
      const data = JSON.parse(savedUserData);
      const token = data.accessToken;
      try {
        const updatedEpisodeData = { ...selectedEpisode };

        console.log(updatedEpisodeData);

        const response = await fetch(
          `${API}/series/${series._id}/seasons/${selectedSeason}/episodes/${selectedEpisodeId}`,

          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedEpisodeData),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  console.log(selectedEpisodeId);
  return (
    <div className="dashboard">
      <Sidebar />
      <AdminTopbar />
      {series && (
        <div className="container">
          <h2>Edit Series</h2>
          <form>
            <div className="editSeriesFormContainer">
              <div className="leftColumn">
                <div className="formGroup">
                  <label>Title:</label>
                  <input
                    type="text"
                    name="title"
                    placeholder={series.title}
                    value={formData.title || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="formGroup">
                  <label>Director:</label>
                  <input
                    type="text"
                    name="director"
                    placeholder={series.director}
                    value={formData.director || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="formGroup">
                  <label>Year:</label>
                  <input
                    type="text"
                    name="releaseDate"
                    placeholder={series.releaseDate}
                    value={formData.releaseDate || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="formGroup">
                  <label>Limit:</label>
                  <input
                    type="text"
                    name="ageLimit"
                    placeholder={series.ageLimit}
                    value={formData.ageLimit || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="formGroup">
                  <label>Description:</label>
                  <textarea
                    name="description"
                    placeholder={series.description}
                    value={formData.description || ""}
                    onChange={handleInputChange}
                    rows={4} //How many rows in textaera field
                    style={{ width: "280px" }}
                  />
                </div>
                <div className="formGroup">
                  <label>Featured Image:</label>
                  {!formData.imgFeatured ? (
                    <img
                      className="imgFeatured"
                      src={series.imgFeatured}
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
                    onChange={(e) =>
                      handleFileUpload(e, "imgFeatured", formData)
                    } //passing the event object (e) to the handleFileUpload function along with the string "fileType" as an argument
                  />
                </div>

                <div className="formGroup">
                  <label>Thumbnail Image:</label>
                  {!formData.imgThumbnail ? (
                    <img
                      className="imgThumbnail"
                      src={series.imgThumbnail}
                      alt="Thumbnail"
                    />
                  ) : (
                    <img
                      className="imgThumbnail"
                      src={formData.imgThumbnail}
                      alt="Thumbnail"
                      width="100"
                    />
                  )}
                  <br></br>
                  <input
                    type="file"
                    name="imgThumbnail"
                    onChange={(e) =>
                      handleFileUpload(e, "imgThumbnail", formData)
                    }
                  />
                </div>

                <div className="formGroup">
                  <label>Video:</label>
                  <input
                    type="file"
                    accept="video/*"
                    name="video"
                    onChange={(e) => handleFileUpload(e, "video", formData)}
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
                    {series.tags.map((tag, index) => (
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
                    {series.genres.map((genre, index) => (
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
                      placeholder="Add Genre"
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
                    {series.cast.map((actor, index) => (
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
                    onChange={(e) =>
                      handleFileUpload(e, "videoTrailer", formData)
                    }
                  />
                </div>
                  */}

                <div className="formGroup">
                  <label>Select Season:</label>
                  <select
                    name="season"
                    value={selectedSeason}
                    onChange={(e) => {
                      setSelectedSeason(e.target.value);
                      setSelectedEpisodeId(null); // Reset selectedEpisode to null
                    }}
                  >
                    {series &&
                      series.seasons.map((season) => (
                        <option
                          key={season.seasonNumber}
                          value={season.seasonNumber}
                        >
                          Season {season.seasonNumber}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="formGroup">
                  {selectedSeason && (
                    <div className="form-group">
                      <label>Select Episode:</label>
                      <select
                        name="episode"
                        value={selectedEpisodeId}
                        onChange={(e) => {
                          const episodeId = e.target.value;
                          setSelectedEpisodeId(episodeId);

                          const selectedSeasonNumber = parseInt(selectedSeason);

                          const selectedSeasonObj = series.seasons.find(
                            (season) =>
                              season.seasonNumber === selectedSeasonNumber
                          );

                          const selectedEpisodeObj =
                            selectedSeasonObj.episodes.find(
                              (episode) => episode._id === episodeId
                            );

                          setSelectedEpisode({
                            title: selectedEpisodeObj.title || "",
                            description: selectedEpisodeObj.description || "",
                            thumbnail: selectedEpisodeObj.thumbnail || "",
                            video: selectedEpisodeObj.video || "",
                          });
                        }}
                      >
                        {series &&
                          selectedSeason &&
                          series.seasons
                            .find(
                              (season) =>
                                season.seasonNumber === parseInt(selectedSeason)
                            )
                            .episodes.map((episode) => (
                              <option key={episode._id} value={episode._id}>
                                {episode.title}
                              </option>
                            ))}
                      </select>
                    </div>
                  )}
                </div>
                <div className="formGroup">
                  <label>Episode title:</label>
                  <input
                    name="title"
                    type="text"
                    placeholder={
                      selectedEpisodeId !== null
                        ? selectedEpisode.title
                        : series.seasons[selectedSeason - 1].episodes[0].title
                    }
                    onChange={(e) =>
                      setSelectedEpisode({
                        ...selectedEpisode,
                        title: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="formGroup">
                  <label>Episode Description:</label>
                  <textarea
                    name="description"
                    placeholder={
                      selectedEpisodeId !== null
                        ? selectedEpisode.description
                        : series.seasons[selectedSeason - 1].episodes[0]
                            .description
                    }
                    onChange={(e) =>
                      setSelectedEpisode({
                        ...selectedEpisode,
                        description: e.target.value,
                      })
                    }
                    rows={4}
                    style={{ width: "280px" }}
                  />
                </div>

                <div className="formGroup">
                  <label>Episode Thumbnail:</label>
                  <img
                    className="thumbnail"
                    src={
                      selectedEpisodeId === null
                        ? series.seasons[selectedSeason - 1].episodes[0]
                            .thumbnail
                        : selectedEpisode.thumbnail
                    }
                    alt=" "
                  />

                  <br></br>

                  <input
                    type="file"
                    name="episodeThumbnail"
                    onChange={(e) =>
                      handleFileUpload(e, "thumbnail", selectedEpisode)
                    }
                  />

                  <button
                    className="arrayActions"
                    type="button"
                    onClick={handleUpdateEpisode}
                  >
                    UPDATE
                  </button>
                </div>
              </div>
            </div>
          </form>
          <button className="addMovie" onClick={handleUpdateSeries}>
            Update Series
          </button>
        </div>
      )}
    </div>
  );
};

export default EditSeries;
