import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddRecipe.css';

const AddRecipe = () => {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [instructions, setInstructions] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [cookTime, setCookTime] = useState('');
  const [rating, setRating] = useState(3);

  const navigate = useNavigate();

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addIngredientField = () => {
    setIngredients([...ingredients, '']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to add a recipe.');
      return;
    }

    const recipeData = {
      title,
      imageUrl,
      instructions,
      ingredients: ingredients.filter(ing => ing.trim() !== ''),
      cookTime,
      rating,
    };

    try {
      const response = await fetch('http://localhost:5000/api/user-recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(recipeData),
      });

      if (!response.ok) {
        const errorText = await response.text(); // Αντί για JSON, διάβασε το κείμενο
        console.error('Server error:', errorText);
        alert('Failed to add recipe.');
        return;
      }

      const data = await response.json();

      if (data.success) {
        alert('Recipe added successfully!');
        navigate('/recipes'); // επιστροφή στις συνταγές
      } else {
        alert('Failed to add recipe.');
      }
    } catch (err) {
      console.error('Error submitting recipe:', err);
      alert('Something went wrong.');
    }
  };

  return (
    <div className="add-recipe-container">
      <h1>Add a New Recipe</h1>
      <form className="add-recipe-form" onSubmit={handleSubmit}>
        <label>Title:</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label>Image URL:</label>
        <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required />

        <label>Instructions:</label>
        <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} required />

        <label>Ingredients:</label>
        {ingredients.map((ingredient, index) => (
          <input
            key={index}
            type="text"
            value={ingredient}
            onChange={(e) => handleIngredientChange(index, e.target.value)}
            placeholder={`Ingredient ${index + 1}`}
          />
        ))}
        <button type="button" onClick={addIngredientField}>
          + Add Ingredient
        </button>

        <label>Cook Time:</label>
        <input
          type="text"
          value={cookTime}
          onChange={(e) => setCookTime(e.target.value)}
          placeholder="e.g., 30 minutes"
        />

        <label>Rating (1–5):</label>
        <input
          type="number"
          min="1"
          max="5"
          value={rating}
          onChange={(e) => setRating(parseInt(e.target.value))}
        />

        <button type="submit">Submit Recipe</button>
      </form>
    </div>
  );
};

export default AddRecipe;
