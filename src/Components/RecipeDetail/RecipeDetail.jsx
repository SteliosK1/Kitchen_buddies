import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './RecipeDetail.css';

const RecipeDetail = () => {
  const { recipeId } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isUserRecipe, setIsUserRecipe] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        // Αν είναι αριθμός 5ψηφιος → API, αλλιώς από backend
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
              rating: 4,
              cookTime: meal.strCookTime || 'N/A'
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
              rating: r.rating || 4,
              cookTime: r.cookTime || 'N/A'
            });
            setIsUserRecipe(true);
          }
        }
      } catch (error) {
        console.error('Error fetching recipe details:', error);
      }
    };

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
          setFavorites(data.favorites);
        }
      } catch (err) {
        console.error('Error fetching favorites:', err);
      }
    };

    fetchRecipe();
    fetchFavorites();
  }, [recipeId]);

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

  const renderStars = (rating) => {
    const fullStars = '★'.repeat(Math.floor(rating));
    const emptyStars = '☆'.repeat(5 - Math.floor(rating));
    return fullStars + emptyStars;
  };

  if (!recipe) {
    return <h2>Loading recipe...</h2>;
  }

  return (
    <div className="recipe-detail">
      <h1>{recipe.title}</h1>
      <img src={recipe.image} alt={recipe.title} className="recipe-image" />
      
      <div className="rating-stars">{renderStars(recipe.rating)}</div>

      <div className="recipe-timer-favorite">
        <div className="recipe-timer">⏱ {recipe.cookTime}</div>
        <div className="favorite-icon" onClick={toggleFavorite}>
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
