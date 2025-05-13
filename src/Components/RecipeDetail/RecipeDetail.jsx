import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useFavorites } from '../../Context/FavoritesContext';
import './RecipeDetail.css';

const RecipeDetail = () => {
  const { recipeId } = useParams();
  const { favorites, toggleFavorite } = useFavorites();
  const [recipe, setRecipe] = useState(null);
  const [isUserRecipe, setIsUserRecipe] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState(null);
  const token = localStorage.getItem('token');
  const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null; // Decode user ID from token

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        if (/^\d{5,}$/.test(recipeId)) {
          const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`);
          const data = await response.json();
          if (data.meals && data.meals.length > 0) {
            const meal = data.meals[0];
            setRecipe({
              id: meal.idMeal,
              title: meal.strMeal,
              image: meal.strMealThumb,
              instructions: meal.strInstructions,
              ingredients: Array.from({ length: 20 }, (_, i) => meal[`strIngredient${i + 1}`]).filter(Boolean),
              rating: 4
            });
            setIsUserRecipe(false);
          }
        } else {
          const response = await fetch(`http://localhost:5000/api/user-recipes/${recipeId}`);
          const data = await response.json();
          if (data.success) {
            const r = data.recipe;
            setRecipe({
              id: r.id,
              title: r.title,
              image: r.imageUrl,
              instructions: r.instructions,
              ingredients: r.ingredients, // assumed to be array
              rating: r.rating || 4
            });
            setIsUserRecipe(true);
          }
        }
      } catch (error) {
        console.error('Error fetching recipe details:', error);
      }
    };

    const fetchRatings = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/ratings/${recipeId}?userId=${userId || ''}`);
        const data = await res.json();
        if (data.success) {
          setAverageRating(data.averageRating);
          if (userId) {
            setUserRating(data.userRating);
          }
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    };

    fetchRecipe();
    fetchRatings();
  }, [recipeId, userId]);

  const submitRating = async (rating) => {
    if (!userId) return; // Μόνο συνδεδεμένοι χρήστες μπορούν να υποβάλουν αξιολόγηση

    try {
      const res = await fetch('http://localhost:5000/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, recipeId, rating }),
      });

      const data = await res.json();
      if (data.success) {
        setUserRating(rating);
        const updatedRatings = await fetch(`http://localhost:5000/api/ratings/${recipeId}`);
        const updatedData = await updatedRatings.json();
        setAverageRating(updatedData.averageRating);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const renderStars = (rating, onClick) => {
    return [...Array(5)].map((_, index) => (
      <span
        key={index}
        className={`star ${index < rating ? 'filled' : ''}`}
        onClick={() => onClick && onClick(index + 1)}
      >
        ★
      </span>
    ));
  };

  if (!recipe) {
    return <h2>Loading recipe...</h2>;
  }

  return (
    <div className="recipe-detail">
      <h1>{recipe.title}</h1>
      <img src={recipe.image} alt={recipe.title} className="recipe-image" />

      <div className="rating-section">
        <div className="average-rating">
          Average Rating: {renderStars(Math.round(averageRating))}
        </div>
        {userId && (
          <div className="user-rating">
            Your Rating: {renderStars(userRating || 0, submitRating)}
          </div>
        )}
      </div>

      <div className="rating-and-favorite">
        <div className="favorite-icon" onClick={() => toggleFavorite(recipeId)}>
          {favorites.includes(recipeId) ? '❤️' : '🤍'}
        </div>
      </div>

      <h2>Ingredients</h2>
      <ul>
        {recipe.ingredients.map((ing, index) => (
          <li key={index}>{ing}</li>
        ))}
      </ul>

      <h2>Steps</h2>
      <div className="instructions">{recipe.instructions}</div>
    </div>
  );
};

export default RecipeDetail;
