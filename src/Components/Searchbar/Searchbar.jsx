import React from 'react';
import './Searchbar.css';

const SearchBar = ({ onSearch }) => {
  const handleInputChange = (e) => {
    onSearch(e.target.value); // Ενημερώνουμε το query αναζήτησης
  };

  return (
    <div className="search">
      <input
        className="srch"
        type="search"
        placeholder="Search recipes..."
        onChange={handleInputChange}
      />
      <button className="btn">Search</button>
    </div>
  );
};

export default SearchBar;