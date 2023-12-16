import React from "react";
import { HashRouter, Routes, Route} from "react-router-dom";
import { MyProvider } from "../MyContext";
import Home from "../pages/home/Home";
import Watchlist from "../pages/watchlist/Watchlist";
import Watch from "../pages/watch/Watch";
import WatchMovie from "../pages/watch/WatchMovie";
import EditMovie from "../pages/dashboardActions/EditMovie";
import EditSeries from "../pages/dashboardActions/EditSeries";
import NewMovie from "../pages/dashboardActions/NewMovie";
import NewSeries from "../pages/dashboardActions/NewSeries";
import NewList from "../pages/dashboardActions/NewList";
import MovieList from "../pages/dashboardActions/MovieList";
import EditList from "../pages/dashboardActions/EditList";
import ListList from "../pages/dashboardActions/ListList";
import SeriesList from "../pages/dashboardActions/SeriesList";
import Login from "../pages/login/Login";
export default function App() {
  return (
    <div>
      <HashRouter>
        <MyProvider>
          <Routes>
            <Route path="/browse" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/movies" element={<Home type="movies" />} />
            <Route path="/series" element={<Home type="series" />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/product/:movieId" element={<Home />} />
            <Route
              path="/product/:movieId/watch/:episodeId"
              element={<Watch />}
            />
            <Route path="/product/:movieId/watch" element={<WatchMovie />} />
            <Route path="admin/movies" element={<MovieList />} />
            <Route path="admin/movies/new" element={<NewMovie />} />
            <Route path="admin/movies/edit/:movieId" element={<EditMovie />} />
            <Route path="admin/series" element={<SeriesList />} />
            <Route path="admin/series/new" element={<NewSeries />} />
            <Route
              path="admin/series/edit/:seriesId"
              element={<EditSeries />}
            />
            <Route path="admin/lists" element={<ListList />} />
            <Route path="admin/lists/new" element={<NewList />} />
            <Route path="/lists/edit/:listId" element={<EditList />} />
            <Route
              path="/"
              element={
                localStorage.getItem("userData") ? (
                  // Render the Home component for the root path "/"
                  <Home />
                ) : (
                  // Redirect to the login page if user data is not available
                  <Login />
                )
              }
            />
          </Routes>
        </MyProvider>
      </HashRouter>
    </div>
  );
}
