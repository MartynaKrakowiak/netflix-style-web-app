import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useMyContext } from "../../MyContext";
import "./home.scss";
import Topbar from "../../components/Topbar";
import Featured from "../../components/Featured";
import List from "../../components/List";
import MovieModal from "../../components/MovieModal";
import Footer from "../../components/Footer";
import Searchlist from "../searchlist/Searchlist";
import API from "../../apiConfig";
const Home = ({ type }) => {
  const { isSearchbarActive, selectListGenre } = useMyContext();
  const [isModalOpenInHome, setIsModalOpenInHome] = useState(false);
  const { movieId } = useParams();

  const handleModalOpenChange = (isOpen) => {
    setIsModalOpenInHome(isOpen);

    if (!isOpen) {
      setIsModalOpenInHome(isOpen);
      const newUrl = `#/`;
      window.history.replaceState(null, "", newUrl);
    }
  };

  useEffect(() => {
    // Check if there's a movieId in the URL
    if (movieId) {
      setIsModalOpenInHome(true);
    }
  }, [movieId]);

  const [lists, setLists] = useState([]);
  console.log(lists)

  useEffect(() => {
    if (isModalOpenInHome) {
      // When the modal is opened, set body overflow to hidden
      document.body.style.overflow = "hidden";
      document.body.style.width = "105%";
    } else {
      // When the modal is closed, reset body overflow to auto
      document.body.style.overflow = "auto";
      document.body.style.width = "100%";
    }

    // Clean up by resetting body overflow when the component unmounts
    return () => {
      document.body.style.overflow = "auto";
      document.body.style.width = "100%";
    };
  }, [isModalOpenInHome]);

  // Effect to fetch random lists based on type and genre
  useEffect(() => {
    const getRandomLists = async () => {
      try {
        let apiUrl = `${API}/lists`;
        if (type || selectListGenre) {
          apiUrl += "?";

          if (type) {
            apiUrl += "type=" + type;
          }

          if (selectListGenre) {
            apiUrl += (type ? "&" : "") + "genre=" + selectListGenre;
          }
        };
        console.log(apiUrl)
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        setLists(data);
  
      } catch (error) {
        console.log(error);
      }
    };

    getRandomLists();
  }, [type, selectListGenre]);


  return (
    <div className="home">
      {!isModalOpenInHome && <Topbar />}
      {isSearchbarActive ? (
        // If the search bar is active, render the Searchlist component
        <Searchlist />
      ) : (
        // If the search bar is not active, render other components
        <>
          <Featured type={type} onModalOpenChange={handleModalOpenChange} />
          {lists.map((list) => (
            <List list={list} onModalOpenChange={handleModalOpenChange} />
          ))}

          <div className={`modalWrapper ${isModalOpenInHome ? "active" : ""}`}>
            {isModalOpenInHome && (
              <MovieModal onModalOpenChange={handleModalOpenChange} />
            )}
          </div>
        </>
      )}
      <br></br>
      <br></br>
      <br></br>
      <Footer />
    </div>
  );
};

export default Home;
