import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoritesContext = createContext();

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!token) return;

      try {
        const res = await fetch('http://localhost:5000/api/favorites', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },bhj
        });

        const data = await res.json();
        if (data.success) {
          setFavorites(data.favorites);
        }
      } catch (err) {
        console.error('Error fetching favorites:', err);
      }
    };

    fetchFavorites();
  }, [token]);

  const toggleFavorite = async (recipeId) => {
    if (!token) return;

    try {
      if (favorites.includes(recipeId)) {
        await fetch('http://localhost:5000/api/favorites/rm', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ recipeId }),
        });
        setFavorites(favorites.filter((id) => id !== recipeId));
      } else {
        await fetch('http://localhost:5000/api/favorites/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ recipeId }),
        });
        setFavorites([...favorites, recipeId]);
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);