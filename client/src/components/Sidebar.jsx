import React from "react";
import "./sidebar.scss";
import { Link } from "react-router-dom";
import {
  House,
  FilmSlate,
  Television,
  List,
  Barcode,
  SignOut,
} from "@phosphor-icons/react";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="logo">
        <img
          src="https://www.edigitalagency.com.au/wp-content/uploads/netflix-logo-white-png.png"
          alt=""
        />
      </div>
      <div className="avatar">
        <img
          src="https://i.pinimg.com/564x/b9/62/7c/b9627cb81085f9f29b28594076b50ec2.jpg"
          alt=""
        />
      </div>
      <div className="menu">
        <li>
          <Link to={`/`}>
            <House size={24} /> <span>Dashboard</span>
          </Link>
        </li>
        <li>
          <Link to={`/admin/movies`}>
            <FilmSlate size={24} /> <span>Movies</span>
          </Link>
        </li>
        <li>
          <Link to={`/admin/series`}>
            <Television size={24} /> <span>TV Series</span>
          </Link>
        </li>
        <li>
          <Link to={`/admin/lists`}>
            <List size={24} /> <span>Lists</span>
          </Link>
        </li>
        <li>
          <Link to={`/admin/categories`}>
            <Barcode size={24} /> <span>Categories</span>
          </Link>
        </li>
        <li>
          <Link to={`/signout`}>
            <SignOut size={24} /> <span>Sign Out</span>
          </Link>
        </li>
      </div>
    </div>
  );
};

export default Sidebar;
