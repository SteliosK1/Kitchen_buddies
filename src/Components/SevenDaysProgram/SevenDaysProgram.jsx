import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './SevenDaysProgram.css';

const dayTitles = [
  'Healthy Breakfast',
  'Light Lunch',
  'Protein Power',
  'Veggie Day',
  'Mediterranean',
  'Cheat Meal',
  'Family Dinner',
];

// Helper: Υπολογισμός εβδομάδας έτους
function getCurrentWeekNumber() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = (now - start + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60000));
  const oneWeek = 604800000;
  return Math.floor(diff / oneWeek);
}

// Simple seeded random (για σταθερότητα μέσα στην εβδομάδα)
function seededRandom(seed) {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Παράγει 7 μοναδικά random IDs με βάση το seed
function getWeeklyRandomIds(seed, min, max, count) {
  const ids = new Set();
  let i = 0;
  while (ids.size < count) {
    const rand = Math.floor(seededRandom(seed + i) * (max - min + 1)) + min;
    ids.add(rand);
    i++;
  }
  return Array.from(ids);
}

const SevenDaysProgram = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const week = getCurrentWeekNumber();
        // IDs από 52947 έως 52966 (20 διαθέσιμες στο Recipes.jsx)
        const ids = getWeeklyRandomIds(week + new Date().getFullYear(), 52947, 52966, 7);
        const arr = [];
        for (let id of ids) {
          const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
          const data = await response.json();
          const meal = data.meals?.[0];
          if (meal) {
            arr.push({
              id: meal.idMeal,
              title: meal.strMeal,
              image: meal.strMealThumb,
            });
          }
        }
        setRecipes(arr);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      }
      setLoading(false);
    };
    fetchRecipes();
  }, []);

  if (loading) {
    return (
      <div className="seven-days-container">
        <h1>7 Days Program</h1>
        <p>Loading recipes...</p>
      </div>
    );
  }

  return (
    <div className="seven-days-container">
      <h1>7 Days Program</h1>
      <p className="seven-days-intro">
        Welcome to your 7-day meal plan! Discover a new recipe for each day and enjoy healthy, tasty meals all week.
      </p>
      <ul className="seven-days-list">
        {recipes.map((recipe, idx) => (
          <Link to={`/recipes/${recipe.id}`} key={recipe.id} style={{ textDecoration: 'none', color: 'inherit' }}>
            <li className="seven-days-item">
              <span className="day-number">{idx + 1}</span>
              <span className="day-desc">
                <strong>{dayTitles[idx]}:</strong> {recipe.title}
              </span>
              <img src={recipe.image} alt={recipe.title} className="seven-days-img" />
            </li>
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default SevenDaysProgram;