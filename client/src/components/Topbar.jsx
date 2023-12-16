import React, { useState } from "react";
import { Link } from "react-router-dom";
import {MagnifyingGlass,Bell,CaretDown,CaretUp,X,Pencil,User,Question,Wrench} from "@phosphor-icons/react";
import { useMyContext } from "../MyContext";
import "./topbar.scss";
import { useNavigate } from 'react-router-dom';
const Topbar = () => {
  // State management using context and local state
  const navigate = useNavigate();
  const { isSearchbarActive, updateIsSearchbarActive } = useMyContext();
  const { searchbarQuery, updateSearchbarQuery } = useMyContext();
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Function to handle the search icon click
  const handleSearchIconClick = () => {
    setIsSearchActive((prevState) => !prevState);
  };

  // State to track if the user has scrolled
  const [isScrolled, setIsScrolled] = useState(false);

  // Event listener to check if the user has scrolled
  window.onscroll = () => {
    setIsScrolled(window.pageYOffset === 0 ? false : true);
  };

  // Function to handle input change in the search bar
  const handleInputChange = (event) => {
    const inputValue = event.target.value;
    updateSearchbarQuery(inputValue);
    updateIsSearchbarActive(inputValue.trim() !== ""); // Set isSearchActive to true if there's input
    setInputValue(inputValue);
  };

  // Function to clear the search bar
  const handleXClick = () => {
    updateSearchbarQuery("");
    updateIsSearchbarActive(false);
    setInputValue("");
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem('userData');
    navigate('/login');
  };

  return (
    <div className={isScrolled ? "topbar scrolled" : "topbar"}>
      <div className="wrapper">
        <div className="left">
          {/* Navigation links */}
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/0/0c/Netflix_2014_logo.svg"
            alt=""
          />
          <Link to="/">
            <span>Home</span>
          </Link>
          <Link to="/series">
            <span>TV Shows</span>
          </Link>
          <Link to="/movies">
            <span>Movies</span>
          </Link>
          <span>Recently Added</span>
          <Link to="/watchlist">
            <span>My List</span>
          </Link>
        </div>

        <div className="right">
          {/* Search icon */}
          <MagnifyingGlass
            className={`searchIcon ${isSearchActive ? "active" : ""}`}
            onClick={handleSearchIconClick}
          />

          {/* Search bar */}
          <div className={`searchBar ${isSearchActive ? "active" : ""}`}>
            <input
              type="text"
              placeholder="Titles, people, genres"
              onChange={handleInputChange}
              value={inputValue}
            />
            {isSearchbarActive && (
              <X onClick={handleXClick} weight="bold" size={26} />
            )}
          </div>

          <span>Kids</span>

          <Bell className="bell" size={26} />

          <div className="profile">
            {/* User profile section */}
            <img
              src="https://wallpapers.com/images/hd/netflix-profile-pictures-1000-x-1000-88wkdmjrorckekha.jpg"
              alt=""
            />
            <CaretDown className="expandProfile" size={18} weight="fill" />

            <div className="profileContainer">
              <CaretUp className="example" size={20} weight="fill" />

              <div className="options">
                {/* User profile options */}
                <div className="users">
                  <p>
                    <img
                      className="icon"
                      src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png"
                      alt=""
                    />{" "}
                    <span>Username 1</span>
                  </p>
                  <p>
                    <img
                      className="icon"
                      src="https://i.pinimg.com/736x/bd/ee/4c/bdee4c328550aaf21aa9f43fd19e2136.jpg"
                      alt=""
                    />
                    <span>Username 2</span>
                  </p>
                </div>

                <div className="actions">
                  <p>
                    <Pencil className="icon" size={28} />
                    <span>Manage Profiles</span>
                  </p>
                  <p>
                    <User className="icon" size={28} />
                    <span>Account</span>
                  </p>
                  <p>
                    <Question className="icon" size={28} />
                    <span>Help Center</span>
                  </p>

                  <p>
                    <Wrench className="icon" size={28} weight="fill" />
                    <Link to="/admin/movies">
                    <span>Manage Content</span>
                    </Link>
                  </p>
                </div>{" "}
                <p className="signOut">
                  <span onClick={handleLogout}>Sign out of Netflix</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
