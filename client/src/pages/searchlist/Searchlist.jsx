import React, { useContext, useEffect, useState } from "react";

import SearchlistRow from "./SearchlistRow"
import Footer from "../../components/Footer";
import { useMyContext } from "../../MyContext";
import "../watchlist/watchlist.scss"
import API from "../../apiConfig";
const Searchlist = () => {

  const {searchbarQuery} = useMyContext();
  const [idArray, setidArray] = useState([])

  useEffect(() => {
    // Define a function to search for movies on the server
    const searchMoviesOnServer = async () => {
    // Construct the full URL with the query
    const fullURL = `${API}/movies/search?query=${searchbarQuery}`;
  
    // Make an HTTP GET request to the server
    fetch(fullURL)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
          return response.json();
        })
        .then((data) => {
          setidArray(data.map((movie) => movie._id));
         
          // Handle the data on the client side
          // You can update state with the search results here
          console.log(data); // Replace this with your actual handling logic
        })
        .catch((error) => {
          console.error('Error:', error);
        });
      };
      searchMoviesOnServer()
      // Call searchMoviesOnServer when the component mounts
     // searchMoviesOnServer(searchQuery);
    }, [searchbarQuery]); // Run the effect when searchQuery changes
    
    return (
      <div className="watchlist">
        <div className="listItemWrapper">
          <SearchlistRow arr={idArray}/>
        </div>
        <br></br>
        <br></br>
        <Footer/>
      </div>
    )
};

export default Searchlist;