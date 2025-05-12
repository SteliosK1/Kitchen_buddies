import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './RecipeDetail.css';


const RecipeDetail = () => {
  const { recipeId } = useParams(); // Παίρνουμε το ID της συνταγής από το URL
  const [recipe, setRecipe] = useState(null);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // Φόρτωση συνταγής από το API με βάση το recipeId
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`);
        const data = await response.json();
        setRecipe(data.meals[0]); // Αποθήκευση της συνταγής από την API
      } catch (error) {
        console.error('Error fetching recipe details:', error);
      }
    };

    fetchRecipe();

    const fetchFavorites = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:5000/api/favorites', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setFavorites(data.favorites); // πίνακας με recipeIds
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  fetchFavorites();
  }, [recipeId]); // Εκτελείται κάθε φορά που το recipeId αλλάζει

  if (!recipe) {
    return <h2>Loading recipe...</h2>; // Όταν τα δεδομένα φορτώνουν
  }

  const renderStars = (rating) => {
    const fullStars = '★'.repeat(Math.floor(rating));
    const emptyStars = '☆'.repeat(5 - Math.floor(rating));
    return fullStars + emptyStars;
  };

  const toggleFavorite = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
      if (favorites.includes(recipeId)) {
        await fetch('http://localhost:5000/api/favorites/rm', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ recipeId }),
        });
        setFavorites(favorites.filter(id => id !== recipeId));
      } else {
        await fetch('http://localhost:5000/api/favorites/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ recipeId }),
        });
        setFavorites([...favorites, recipeId]);
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };


  return (
    <div className="recipe-detail">
      <h1>{recipe.strMeal}</h1>
      <img src={recipe.strMealThumb} alt={recipe.strMeal} className="recipe-image" />
      <div className="rating-stars">
        {renderStars(recipe.strRating || 0)} {/* Εμφάνιση των αστεριών */}
      </div>
      {/* Χρόνος και Αγαπημένο Icon */}
      <div className="recipe-timer-favorite">
        <div className="recipe-timer">
          ⏱ {recipe.strCookTime || 'N/A'}
        </div>
        <div className="favorite-icon" onClick={toggleFavorite}>
          {favorites.includes(recipeId) ? '❤️' : '🤍'}
        </div>
      </div>
      <h2>Ingredients</h2>
      <ul>
        {/* Εμφάνιση των συστατικών από το API */}
        {Array.from({ length: 20 }, (_, index) => {
          const ingredient = recipe[`strIngredient${index + 1}`];
          if (ingredient) {
            return <li key={index}>{ingredient}</li>;
          }
          return null;
        })}
      </ul>
      <h2>Steps</h2>
      <div className="instructions">
        {recipe.strInstructions}
      </div>

    </div>
  );
};

export default RecipeDetail;
