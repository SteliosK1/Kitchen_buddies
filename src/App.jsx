import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import SevenDaysProgram from './Components/SevenDaysProgram/SevenDaysProgram';
import ResetPassword from './Components/ResetPassword/ResetPassword';
import ForgotPassword from './Components/ForgotPassword/ForgotPassword';
import { FavoritesProvider } from './Context/FavoritesContext'; 

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
    } else if (location.pathname === '/7days') {
      body.classList.add('seven-days-background');
    } else {
      body.classList.add('default-background');
    }
  }, [location]);

  const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
  };

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
        <Route
          path="/add-recipe"
          element={
            <PrivateRoute>
              <AddRecipe />
            </PrivateRoute>
          }
        />
        <Route path="/edit-recipe/:recipeId" element={<EditRecipe />} />
        <Route path="/7days" element={<SevenDaysProgram />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
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