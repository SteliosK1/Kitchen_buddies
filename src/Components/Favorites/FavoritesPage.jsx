import React, { useEffect, useState } from 'react';
import { useFavorites } from '../../Context/FavoritesContext';
import './FavoritesPage.css';

const FavoritesPage = () => {
  const { favorites } = useFavorites();
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token'); // Έλεγχος αν υπάρχει token

  useEffect(() => {
    if (!token) {
      setLoading(false); // Σταματάμε τη φόρτωση αν δεν υπάρχει token
      return;
    }

    const fetchFavoriteRecipes = async () => {
      setLoading(true);
      const recipePromises = favorites.map(async (id) => {
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
      setFavoriteRecipes(resolved.filter(Boolean));
      setLoading(false);
    };

    fetchFavoriteRecipes();
  }, [favorites, token]);

  if (!token) {
    // Επιστρέφουμε μήνυμα αν ο χρήστης δεν είναι συνδεδεμένος
    return (
      <div className="not-logged-in">
        <div className="overlay">
          <p className="not-logged-in-message">Please log in to view your favorite recipes.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    // Επιστρέφουμε το spinner αν τα δεδομένα φορτώνονται
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
      {favoriteRecipes.length === 0 ? null : (
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
