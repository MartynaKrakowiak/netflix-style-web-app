import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../dashboard/dashboard.scss";
import "./listList.scss";
import Sidebar from "../../components/Sidebar";
import { TrashSimple } from "@phosphor-icons/react";
import AdminTopbar from "../../components/AdminTopbar";
import API from "../../apiConfig";
const ListList = () => {
  const [lists, setLists] = useState([]);

  useEffect(() => {
    const savedUserData = localStorage.getItem("userData");

    if (savedUserData) {
      const data = JSON.parse(savedUserData);
      const token = data.accessToken;

      fetch(`${API}/lists/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((data) => setLists(data))
        .catch((error) => console.error("Error fetching lists:", error));
    }
  }, []);

  const handleRemoveList = async (listId) => {
    try {
      const response = await fetch(`${API}/lists/${listId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Remove the deleted list from the state
      setLists((prevLists) => prevLists.filter((list) => list._id !== listId));
    } catch (err) {
      console.error(err);
    }
  };

  // Function to get 5 random movie titles from a list
  const getRandomMovieTitles = (list) => {
    const items = [...list.content]; // Create a copy of the original content array

    // Fisher-Yates (Knuth) shuffle algorithm
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]]; // Swap elements
    }

    return items;
  };

  console.log(lists);
  return (
    <div className="dashboard">
      <Sidebar />
      <AdminTopbar />
      <div className="container">
        <h2>Lists</h2>
        <Link to="new">
          <button className="addNew">Add New</button>
        </Link>
        <div className="listTable">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Genres</th>
                <th>Random Movie Titles</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {lists.length > 0 ? (
                lists.map((list) => {
                  // Shuffle the content of the current list
                  const shuffledContent = getRandomMovieTitles(list);

                  return (
                    <tr key={list._id}>
                      <td className="title-cell">
                        <img
                          src={shuffledContent[0].imgFeatured}
                          alt={`Thumbnail for ${shuffledContent[0].title}`}
                        />
                        {list.title}
                      </td>
                      <td>{list.genres.join(", ")}</td>
                      <td>
                        {shuffledContent
                          .slice(0, 5)
                          .map((movie) => movie.title)
                          .join(", ")}
                        ...
                      </td>
                      <td>
                        <div className="buttons">
                          <Link to={`/lists/edit/${list._id}`}>
                            <button className="edit">Edit</button>
                          </Link>
                          <TrashSimple
                            className="bin"
                            size={24}
                            onClick={() => handleRemoveList(list._id)}
                          >
                            Remove
                          </TrashSimple>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5">No lists available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ListList;
