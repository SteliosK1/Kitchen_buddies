import React, { useEffect, useState } from 'react';
import './FavoritesPage.css';

const FavoritesPage = () => {
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setLoading(false); // Σταματάμε το loading αν δεν υπάρχει token
      return;
    }

    const fetchFavorites = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/favorites', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          const favoriteIds = data.favorites;

          const recipePromises = favoriteIds.map(async (id) => {
            const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
            const data = await res.json();
            const meal = data.meals?.[0];

            return meal
              ? {
                  id: meal.idMeal,
                  title: meal.strMeal,
                  image: meal.strMealThumb,
                }
              : null;
          });

          const resolved = await Promise.all(recipePromises);
          const filtered = resolved.filter(Boolean);
          setFavoriteRecipes(filtered);
        } else {
          alert('Error loading favorites');
        }
      } catch (err) {
        console.error('Error fetching favorites:', err);
        alert('Error connecting to the server');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [token]);

  if (!token) {
    return (
      <div className="not-logged-in">
        <div className="overlay">
          <p className="not-logged-in-message">Please log in to view your favorites.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p className='loading-text'>Loading recipes...</p>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <h1>Your Favorite Recipes</h1>
      {favoriteRecipes.length === 0 ? (
        <p>You have no favorite recipes yet.</p>
      ) : (
        <div className="card-grid">
          {favoriteRecipes.map((recipe) => (
            <div className="recipe-card" key={recipe.id}>
              <img src={recipe.image} alt={recipe.title} className="recipe-image" />
              <div className="recipe-info">
                <h3>{recipe.title}</h3>
                <a href={`/recipes/${recipe.id}`} className="view-button">
                  View Recipe
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
