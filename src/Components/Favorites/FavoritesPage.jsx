import React, { useEffect, useState } from 'react';
import './FavoritesPage.css';

const FavoritesPage = () => {
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('Πρέπει να συνδεθείτε για να δείτε τα αγαπημένα σας!');
      window.location.href = '/';
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
          alert('Σφάλμα κατά τη φόρτωση των αγαπημένων');
        }
      } catch (err) {
        console.error('Error fetching favorites:', err);
        alert('Σφάλμα σύνδεσης με τον διακομιστή');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  if (loading) {
    return <p>Φόρτωση αγαπημένων...</p>;
  }

  return (
    <div className="favorites-container">
      <h1>Οι αγαπημένες σας συνταγές</h1>
      {favoriteRecipes.length === 0 ? (
        <p>Δεν έχετε αγαπημένες συνταγές ακόμα.</p>
      ) : (
        <div className="card-grid">
          {favoriteRecipes.map((recipe) => (
            <div className="recipe-card" key={recipe.id}>
              <img src={recipe.image} alt={recipe.title} className="recipe-image" />
              <div className="recipe-info">
                <h3>{recipe.title}</h3>
                <a href={`/recipes/${recipe.id}`} className="view-button">
                  Προβολή συνταγής
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
