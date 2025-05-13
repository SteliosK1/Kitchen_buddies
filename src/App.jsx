import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar';
import Hero from './Components/Hero/Hero';
import About from './Components/About/About';
import Recipes from './Components/Recipes/Recipes';
import RecipeDetail from './Components/RecipeDetail/RecipeDetail';
import Contact from './Components/Contact/Contact';
import AuthContainer from './Components/AuthContainer/AuthContainer';
import Profile from './Components/Profile/Profile';
import FavoritesPage from './Components/Favorites/FavoritesPage';
import AddRecipe from './Components/AddRecipe/AddRecipe';
import EditRecipe from './Components/EditRecipe/EditRecipe';
import { FavoritesProvider } from './Context/FavoritesContext'; // Εισαγωγή του FavoritesProvider

const App = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const body = document.body;

    body.classList.remove(
      'home-background',
      'about-background',
      'recipes-background',
      'contact-background',
      'profile-background',
      'favorites-background',
      'default-background',
      'add-recipe-background',
      'spoon-background'
    );

    if (location.pathname === '/spoon') {
      body.classList.add('spoon-background');
    } else if (location.pathname === '/') {
      body.classList.add('home-background');
    } else if (location.pathname === '/About') {
      body.classList.add('about-background');
    } else if (location.pathname === '/recipes') {
      body.classList.add('recipes-background');
    } else if (location.pathname === '/contact') {
      body.classList.add('contact-background');
    } else if (location.pathname.startsWith('/recipes/')) {
      body.classList.add('recipe-detail-background');
    } else if (location.pathname === '/profile') {
      body.classList.add('profile-background');
    } else if (location.pathname === '/favorites') {
      body.classList.add('favorites-background');
    } else if (location.pathname === '/add-recipe') {
      body.classList.add('add-recipe-background');
    } else if (location.pathname === '/edit-recipe'){
      body.classList.add('add-recipe-background');
    } else {
      body.classList.add('default-background');
    }
  }, [location]);

  return (
    <>
      <Navbar onSearch={setSearchQuery} />
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <Hero />
              <AuthContainer />
            </div>
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="/recipes" element={<Recipes searchQuery={searchQuery} />} />
        <Route path="/recipes/:recipeId" element={<RecipeDetail />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/add-recipe" element={<AddRecipe />} />
        <Route path="/edit-recipe/:recipeId" element={<EditRecipe />} />
      </Routes>
    </>
  );
};

const AppWrapper = () => (
  <Router>
    <FavoritesProvider>
      <App />
    </FavoritesProvider>
  </Router>
);

export default AppWrapper;