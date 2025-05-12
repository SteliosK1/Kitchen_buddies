import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Recipes.css';

const Recipes = ({ searchQuery }) => {
  const [randomRecipes, setRandomRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const fetchRandomRecipes = async () => {
      try {
        const randomRecipesArr = [];
        for (let i = 52947; i < 52967; i++) {
          const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${i}`);
          const data = await response.json();
          const meal = data.meals[0];
          randomRecipesArr.push({
            id: meal.idMeal,
            title: meal.strMeal,
            image: meal.strMealThumb,
            description: meal.strInstructions.substring(0, 100) + '...',
          });
        }
        setRandomRecipes(randomRecipesArr);
      } catch (error) {
        console.error('Error fetching random recipes:', error);
      } finally {
        setLoading(false); // ✅ Εδώ
      }
    };

    fetchRandomRecipes();

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
  }, []);

  // Συνδυάζουμε τις τοπικές συνταγές με τις random συνταγές
  const combinedRecipes = [...randomRecipes];

  const filteredRecipes = combinedRecipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

 const toggleFavorite = async (recipeId) => {
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

if (loading) {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p className='loading-text'>Loading recipes...</p>
    </div>
  );
}

  return (
    <div className="recipes-content">
      <h1>Our Delicious Recipes</h1>
      <p className="intro-paragraph">
        Welcome to our collection of simple and tasty recipes! Browse through the categories or search for your favorite dish. 
        We keep it easy and fun to cook with minimal ingredients!
      </p>

      <div className="recipe-cards">
        {filteredRecipes.map((recipe) => (
          <div className="recipe-card" key={recipe.id}>
              <div className="favorite-icons" onClick={() => toggleFavorite(recipe.id)}>
                {favorites.includes(recipe.id) ? '❤️' : '🤍'}
              </div>
            <img src={recipe.image} alt={recipe.title} className="recipe-image" />
            <div className="recipe-info">
              <h3>{recipe.title}</h3>
              <p className="recipe-description">{recipe.description}</p>
              <Link to={`/recipes/${recipe.id}`} className="recipe-button">View Recipe</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Recipes;
