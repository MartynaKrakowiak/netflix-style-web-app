import React, {useEffect, useState} from "react";
import { Link } from "react-router-dom";
import { TrashSimple, ArrowLeft, ArrowRight } from "@phosphor-icons/react";
import Sidebar from "../../components/Sidebar";
import AdminTopbar from "../../components/AdminTopbar";
import "../dashboard/dashboard.scss"
import "./movieList.scss"
import API from "../../apiConfig";

const MovieList = ()=>{
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        const savedUserData = localStorage.getItem("userData");

        if (savedUserData) {
            // If user data exists in localStorage, parse it
            const data = JSON.parse(savedUserData);
            const token = data.accessToken;
            fetch(`${API}/movies/all`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json', 
                },
            })
          .then((response) => response.json())
          .then((data) => setMovies(data))
          .catch((error) => console.error("Error fetching movies:", error));    }
        }, []);

    const [currentPage, setCurrentPage] = useState(1);

    // Calculate the range of items to display for the current page
    const itemsPerPage = 8; // Number of items to display per page
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentMovies = movies.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(movies.length / itemsPerPage);

    // Create an array of page numbers for pagination controls
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(movies.length / itemsPerPage); i++) {
        pageNumbers.push(i);
    }

    // Function to handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleRemoveMovie = async (movieId) => {

        const savedUserData = localStorage.getItem("userData");

        if (savedUserData) {
            // If user data exists in localStorage, parse it
            const data = JSON.parse(savedUserData);
            const token = data.accessToken;
            try {
            const response = await fetch(`${API}/movies/${movieId}`, {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  }
            });
        
            if (!response.ok) {
                throw Error(`HTTP error! Status: ${response.status}`);
            }
        
            // Remove the deleted movie from the state
            setMovies((prevMovies) => prevMovies.filter((movie) => movie._id !== movieId));
            } catch (err) {
            console.error(err);
            }
        }
    };

    return(
        <div className="dashboard">
            <Sidebar/>
            <AdminTopbar/>

            <div className="container">
                <h2>Movie List</h2>
                <Link to="new">
                    <button className="addNew">Add New</button>
                </Link>
                <div className="movieTable">
                    <table>
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Director</th>
                                <th>Release</th>
                                <th>Genres</th>
                                <th>Tags</th>
                                <th>Limit</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentMovies.map((movie) => (
                                <tr key={movie._id}>
                                    <td className="title-cell">
                                        <img src={movie.imgFeatured} alt={`Thumbnail for ${movie.title}`} />
                                        <div className="title-text">
                                            {movie.title}
                                        </div>
                                    </td>
                                    <td>{movie.director}</td>
                                    <td className="age">{movie.releaseDate}</td>
                                    <td>{movie.genres.join(", ")}</td>
                                    <td>{movie.tags.join(", ")}</td>
                                    <td>{movie.ageLimit}</td>
                                    <td className="actions-cell">
                                        <div className="buttons">
                                            <Link to={`edit/${movie._id}`}>
                                                <button className="edit">Edit</button>
                                            </Link>
                                            <TrashSimple className="bin" size={24} onClick={() => handleRemoveMovie(movie._id)}>
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
                        {currentPage > 1 && <ArrowLeft onClick={() => handlePageChange(currentPage - 1)} />}
                        <span> {`${currentPage}/${totalPages}`} </span>
                        {currentPage < totalPages && <ArrowRight onClick={() => handlePageChange(currentPage + 1)} />}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MovieList;