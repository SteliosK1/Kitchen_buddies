import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './Components/Navbar/Navbar'
import Searchbar from './Components/Searchbar/Searchbar'
import Hero from './Components/Hero/Hero'
import LoginForm from './Components/LoginForm/LoginForm'
import About from './Components/About/About'
import Recipes from './Components/Recipes/Recipes'
import Contact from './Components/Contact/Contact'

const App = () => {
  const location = useLocation();

  useEffect(() => {
    const body = document.body;
  
    // Καθαρίζει όλες τις κλάσεις πριν προσθέσει τη σωστή
    body.classList.remove(
      'home-background',
      'about-background',
      'recipes-background',
      'contact-background',
      'default-background'
    );
  
    if (location.pathname === '/') {
      body.classList.add('home-background');
    } else if (location.pathname === '/About') {
      body.classList.add('about-background');
    } else if (location.pathname === '/recipes') {
      body.classList.add('recipes-background');
    } else if (location.pathname === '/contact') {
      body.classList.add('contact-background');
    } else {
      body.classList.add('default-background');
    }
  }, [location]);

  return (
    <>
      <Navbar />
      <Searchbar />
      <Routes>
        <Route
          path="/"
          element={
            <div>
              <Hero />
              <LoginForm />
            </div>
          }
        />
        <Route path="/about" element={<About />} />
        <Route path="/recipes" element={<Recipes />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<LoginForm />} />
      </Routes>
    </>
  )
}

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;