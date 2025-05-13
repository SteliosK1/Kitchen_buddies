import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../../Context/FavoritesContext';
import './Recipes.css';

const Recipes = ({ searchQuery }) => {
  const [randomRecipes, setRandomRecipes] = useState([]);
  const [userRecipes, setUserRecipes] = useState([]);
  const { favorites, toggleFavorite } = useFavorites();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const randomRecipesArr = [];
        for (let i = 52947; i < 52967; i++) {
          const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${i}`);
          const data = await response.json();
          const meal = data.meals?.[0];
          if (meal) {
            randomRecipesArr.push({
              id: meal.idMeal,
              title: meal.strMeal,
              image: meal.strMealThumb,
              description: meal.strInstructions.substring(0, 100) + '...',
              isUser: false,
            });
          }
        }
        setRandomRecipes(randomRecipesArr);
      } catch (error) {
        console.error('Error fetching API recipes:', error);
      }
    };

    const fetchUserRecipes = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/user-recipes');
        const data = await res.json();
        if (data.success) {
          const formatted = data.recipes.map((recipe) => ({
            id: recipe.id.toString(), // string για συμβατότητα με API ids
            title: recipe.title,
            image: recipe.image,
            description: recipe.instructions.substring(0, 100) + '...',
            isUser: true,
          }));
          setUserRecipes(formatted);
        }
      } catch (error) {
        console.error('Error fetching user recipes:', error);
      }
    };

    const fetchAll = async () => {
      await Promise.all([fetchRecipes(), fetchUserRecipes()]);
      setLoading(false);
    };

    fetchAll();
  }, []);


  const combinedRecipes = [...userRecipes, ...randomRecipes];

  const filteredRecipes = combinedRecipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <Link to="/add-recipe" className="add-recipe-button">+ Add New Recipe</Link> {/* Νέο κουμπί */}

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
