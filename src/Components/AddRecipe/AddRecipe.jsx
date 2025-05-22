import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddRecipe.css';

const AddRecipe = () => {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [imageFile, setImageFile] = useState(null);

  const navigate = useNavigate();

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addIngredientField = () => {
    setIngredients([...ingredients, '']);
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to add a recipe.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('instructions', instructions);
    formData.append('ingredients', JSON.stringify(ingredients.filter(ing => ing.trim() !== '')));
    if (imageFile) formData.append('image', imageFile);

    try {
      const response = await fetch('http://localhost:5000/api/user-recipes/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        alert('Failed to add recipe.');
        return;
      }

      const data = await response.json();

      if (data.success) {
        alert('Recipe added successfully!');
        navigate('/recipes');
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

        <label>Image:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
        />

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

        <button type="submit">Submit Recipe</button>
      </form>
    </div>
  );
};

export default AddRecipe;
