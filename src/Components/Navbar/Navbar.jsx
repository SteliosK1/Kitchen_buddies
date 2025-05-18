import './Navbar.css';
import React, { useState, useEffect, useRef } from 'react';
import SearchBar from './../Searchbar/Searchbar';

const Navbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setRecipes([]);
      return;
    }

    const fetchRecipes = async () => {
      setLoading(true);
      try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchQuery}`);
        const data = await response.json();
        setRecipes(data.meals || []);
      } catch (error) {
        console.error('Error fetching recipes:', error);
        setRecipes([]);
      }
      setLoading(false);
    };

    fetchRecipes();
  }, [searchQuery]);

  // Κλείσιμο dropdown όταν κάνεις click εκτός
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setRecipes([]);
      }
    };

    if (recipes.length > 0) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [recipes]);

  const handleSelectRecipe = (id) => {
    window.location.href = `/recipes/${id}`;
  };

  return (
    <div className="navbar">
      <div className="icon">
        <a href="/" className="logo-link">
          <h2 className="logo">
            Kitchen
            <div style={{ paddingLeft: "20px" }}>Buddies</div>
          </h2>
        </a>
      </div>

      <div className="menu">
        <ul>
          <li><a href="/About">ABOUT</a></li>
          <li><a href="/recipes">RECIPES</a></li>
          <li><a href="/contact">CONTACT</a></li>
          <li><a href="/profile">PROFILE</a></li>
          <li><a href="/favorites">FAVORITES</a></li>
        </ul>
      </div>

      <div className="search-bar-container" ref={dropdownRef}>
        <SearchBar onSearch={handleSearch} />
        {loading && <p>Loading...</p>}

        {recipes.length > 0 && (
          <div className="dropdown">
            {recipes.map((recipe) => (
              <div
                key={recipe.idMeal}
                className="dropdown-item"
                onClick={() => handleSelectRecipe(recipe.idMeal)}
              >
                <img
                  src={recipe.strMealThumb}
                  alt={recipe.strMeal}
                  className="dropdown-image"
                />
                <span>{recipe.strMeal}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
