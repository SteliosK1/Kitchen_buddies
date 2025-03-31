import React from "react";
import "./Searchbar.css";
const SearchBar = () => {
  return (
    <div className="search">
      <input className="srch" type="search" placeholder="Search recipes..." />
      <button className="btn">Search</button>
    </div>
  );
};

export default SearchBar;

