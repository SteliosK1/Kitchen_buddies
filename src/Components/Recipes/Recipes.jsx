import React from 'react';
import './Recipes.css'; // Βεβαιώσου ότι έχεις το αντίστοιχο CSS αρχείο

const Recipes = () => {
  return (
    <div className="recipes-content">
      <h1>Our Delicious Recipes</h1>
      <p className="intro-paragraph">
        Welcome to our collection of simple and tasty recipes! Browse through the categories or search for your favorite dish. 
        We keep it easy and fun to cook with minimal ingredients!
      </p>

      {/* Recipe Cards */}
      <div className="recipe-cards">
        {/* Recipe 1 */}
        <div className="recipe-card">
          <img src="Spaghetti_Aglio_e_Olio.jpg" alt="Recipe 1" className="recipe-image" />
          <div className="recipe-info">
            <h3>Spaghetti Aglio e Olio</h3>
            <p className="recipe-description">
              A simple and flavorful Italian pasta dish made with garlic, olive oil, and chili flakes. Ready in just 15 minutes!
            </p>
            <a href="recipe-detail.html" className="recipe-button">View Recipe</a>
          </div>
        </div>

        {/* Recipe 2 */}
        <div className="recipe-card">
          <img src="Classic-Pancakes-Landscape-Image.jpg" alt="Recipe 2" className="recipe-image" />
          <div className="recipe-info">
            <h3>Classic Pancakes</h3>
            <p className="recipe-description">
              Fluffy pancakes that are perfect for breakfast or brunch. Served with maple syrup and butter.
            </p>
            <a href="recipe-detail.html" className="recipe-button">View Recipe</a>
          </div>
        </div>

        {/* Recipe 3 */}
        <div className="recipe-card">
          <img src="Caesar_Salad.jpg" alt="Recipe 3" className="recipe-image" />
          <div className="recipe-info">
            <h3>Caesar Salad</h3>
            <p className="recipe-description">
              A fresh and crispy salad with romaine lettuce, croutons, parmesan, and creamy Caesar dressing.
            </p>
            <a href="recipe-detail.html" className="recipe-button">View Recipe</a>
          </div>
        </div>

        {/* Add more recipes as needed */}
      </div>
    </div>
  );
};

export default Recipes;