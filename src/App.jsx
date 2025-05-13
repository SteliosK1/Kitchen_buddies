import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './Components/Navbar/Navbar';
// import Searchbar from './Components/Searchbar/Searchbar';
import Hero from './Components/Hero/Hero';
// import LoginForm from './Components/LoginForm/LoginForm';
import About from './Components/About/About';
import Recipes from './Components/Recipes/Recipes';
import RecipeDetail from './Components/RecipeDetail/RecipeDetail';
import Contact from './Components/Contact/Contact';
import AuthContainer from './Components/AuthContainer/AuthContainer';
import Profile from './Components/Profile/Profile';
import FavoritesPage from './Components/Favorites/FavoritesPage';
import AddRecipe from './Components/AddRecipe/AddRecipe'; // Πρόσθεσε την εισαγωγή του AddRecipe

const App = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState(''); // Χρήση του useState για το query αναζήτησης

  useEffect(() => {
    const body = document.body;

    // Clear all background classes before adding the correct one
    body.classList.remove(
      'home-background',
      'about-background',
      'recipes-background',
      'contact-background',
      'profile-background',
      'favorites-background',
      'default-background',
      'add-recipe-background',
      'spoon-background' // Προσθήκη της νέας κλάσης
    );

    if (location.pathname === '/spoon') {
      body.classList.add('spoon-background'); // Χρήση της νέας κλάσης
    } else if (location.pathname === '/') {
      body.classList.add('home-background');
    } else if (location.pathname === '/About') {
      body.classList.add('about-background');
    } else if (location.pathname === '/recipes') {
      body.classList.add('recipes-background');
    } else if (location.pathname === '/contact') {
      body.classList.add('contact-background');
    } else if (location.pathname.startsWith('/recipes/')) {
      body.classList.add('recipe-detail-background'); // Σταθερή κλάση για όλες τις συνταγές
    } else if (location.pathname === '/profile') {
      body.classList.add('profile-background');
    } else if (location.pathname === '/favorites') {
      body.classList.add('favorites-background');
    } else if (location.pathname === '/add-recipe') {
      body.classList.add('add-recipe-background');
    } else {
      body.classList.add('default-background');
    }
  }, [location]);

  return (
    <>
      <Navbar onSearch={setSearchQuery} /> {/* Περνάμε το setSearchQuery στο Navbar */}
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
        <Route path="/recipes" element={<Recipes searchQuery={searchQuery} />} /> {/* Περνάμε το searchQuery στο Recipes */}
        <Route path="/recipes/:recipeId" element={<RecipeDetail />} /> {/* Δυναμική διαδρομή */}
        <Route path="/contact" element={<Contact />} />
        <Route path="/profile" element={<Profile />} /> {/* Προφίλ χρήστη */}
        <Route path="/favorites" element={<FavoritesPage />} /> {/* Αγαπημένα */}
        <Route path="/add-recipe" element={<AddRecipe />} /> {/* Νέα διαδρομή για το AddRecipe */}
      </Routes>
    </>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;