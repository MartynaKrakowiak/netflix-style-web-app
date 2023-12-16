import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { TrashSimple, ArrowRight, ArrowLeft } from "@phosphor-icons/react";
import "./seriesList.scss";
import Sidebar from "../../components/Sidebar";
import AdminTopbar from "../../components/AdminTopbar";
import API from "../../apiConfig";
const SeriesList = () => {
  const [series, setSeries] = useState([]);

  useEffect(() => {
    const savedUserData = localStorage.getItem("userData");

    if (savedUserData) {
      // If user data exists in localStorage, parse it
      const data = JSON.parse(savedUserData);
      const token = data.accessToken;
      fetch(`${API}/series/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => setSeries(data))
        .catch((error) => console.error("Error fetching movies:", error));
    }
  }, []);

  const [currentPage, setCurrentPage] = useState(1);

  // Calculate the range of items to display for the current page
  const itemsPerPage = 8; // Number of items to display per page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSeries = series.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(series.length / itemsPerPage);

  // Create an array of page numbers for pagination controls
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(series.length / itemsPerPage); i++) {
    pageNumbers.push(i);
  }

  // Function to handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleRemoveSeries = async (serieId) => {
    const savedUserData = localStorage.getItem("userData");
    
    if (savedUserData) {
      const data = JSON.parse(savedUserData);
      const token = data.accessToken;
      try {
        if (serieId) {
          
          const response = await fetch(`${API}/series/${serieId}`, {
            method: "DELETE",
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          console.log("Series has been removed");

          // Update the series state to remove the deleted series
          setSeries((prevSeries) =>
            prevSeries.filter((serie) => serie._id !== serieId)
          );
        }
      } catch (error) {
        console.error(error);
      }
    }
  };
  return (
    <div className="dashboard">
      <Sidebar />
      <AdminTopbar />
      <div className="container">
        <h2>Series List</h2>
        <Link to="new">
          <button className="addNew">Add New</button>
        </Link>
        <div className="seriesTable">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Director</th>
                <th>Release</th>
                <th>Genres</th>
                <th>Tags</th>
                <th>Limit</th>
                <th>Seasons</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentSeries.map((series) => (
                <tr key={series._id}>
                  <td className="title-cell">
                    <img src={series.imgFeatured} />
                    <div className="title-text">{series.title}</div>
                  </td>
                  <td>{series.director}</td>
                  <td className="age">{series.releaseDate}</td>
                  <td>{series.genres.join(", ")}</td>
                  <td>{series.tags.join(", ")}</td>
                  <td>{series.ageLimit}</td>
                  <td> {series.seasons.length}</td>
                  <td className="actions-cell">
                    <div className="buttons">
                      <Link to={`edit/${series._id}`}>
                        <button className="edit">Edit</button>
                      </Link>
                      <TrashSimple
                        className="bin"
                        size={24}
                        onClick={() => handleRemoveSeries(series._id)}
                      >
                        Remove
                      </TrashSimple>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="pagination">
            {currentPage > 1 && (
              <ArrowLeft onClick={() => handlePageChange(currentPage - 1)} />
            )}
            <span> {`${currentPage}/${totalPages}`} </span>
            {currentPage < totalPages && (
              <ArrowRight onClick={() => handlePageChange(currentPage + 1)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default SeriesList;
