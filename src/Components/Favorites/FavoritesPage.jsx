import React, { useEffect, useState } from 'react';
import { useFavorites } from '../../Context/FavoritesContext';
import './FavoritesPage.css';

const FavoritesPage = () => {
  const { favorites, toggleFavorite } = useFavorites();
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchFavoriteRecipes = async () => {
      setLoading(true);

      const userId = JSON.parse(atob(token.split('.')[1])).id;

      const recipePromises = favorites.map(async (id) => {
        try {
          const isUserRecipe = !/^\d{5,5}$/.test(id);
          if (isUserRecipe) {
            const res = await fetch(`http://localhost:5000/api/user-recipes/${id}`);
            const data = await res.json();
            if (data.success && data.recipe) {
              const r = data.recipe;
              return {
                id: r.id,
                title: r.title,
                image: r.image,
                isUser: true,
              };
            }
          } else {
            const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
            const data = await res.json();
            const meal = data.meals?.[0];
            if (meal) {
              return {
                id: meal.idMeal,
                title: meal.strMeal,
                image: meal.strMealThumb,
                isUser: false,
              };
            }
          }
        } catch (error) {
          console.error(`Error fetching recipe with ID ${id}:`, error);
        }
        return null;
      });

      const resolved = await Promise.all(recipePromises);
      setFavoriteRecipes(resolved.filter(Boolean));
      setLoading(false);
    };

    fetchFavoriteRecipes();
  }, [favorites, token]);

  if (!token) {
    return (
      <div className="not-logged-in">
        <div className="overlay">
          <p className="not-logged-in-message">Please log in to view your favorite recipes.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p className="loading-text">Loading your favorite recipes...</p>
      </div>
    );
  }

  return (
    <div className="favorites-container">
      <h1>Your Favorite Recipes</h1>
      {favoriteRecipes.length === 0 ? (
        <p className="no-favorites-text">You have no favorite recipes yet.</p>
      ) : (
        <div className="card-grid">
          {favoriteRecipes.map((recipe) => (
            <div className="recipe-card" key={recipe.id} style={{ position: 'relative' }}>
              <button
                className="remove-favorite-btn"
                title="Remove from favorites"
                onClick={() => toggleFavorite(String(recipe.id))}
              >
                ❤️
              </button>
              <img src={recipe.image} alt={recipe.title} className="recipe-image" />
              <div className="recipe-info">
                <h3>{recipe.title}</h3>
                <a
                  href={`/recipes/${recipe.id}`}
                  className="view-button"
                >
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
