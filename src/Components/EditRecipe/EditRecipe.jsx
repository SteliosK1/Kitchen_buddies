import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './EditRecipe.css';

const EditRecipe = () => {
  const { recipeId } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [instructions, setInstructions] = useState('');
  const [ingredients, setIngredients] = useState(['']);
  const [cookTime, setCookTime] = useState('');
  const [rating, setRating] = useState(3);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/user-recipes/${recipeId}`);
        const data = await res.json();
        if (data.success) {
          const r = data.recipe;
          setTitle(r.title);
          setImageUrl(r.image);
          setInstructions(r.instructions);
          setIngredients(Array.isArray(r.ingredients) ? r.ingredients : JSON.parse(r.ingredients));
          setCookTime(r.cook_time || '');
          setRating(r.rating || 3);
        } else {
          alert('Recipe not found');
          navigate('/recipes');
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
      }
    };

    fetchRecipe();
  }, [recipeId, navigate]);

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

    if (!token) {
      alert('You must be logged in to edit a recipe.');
      return;
    }

    const updatedRecipe = {
      title,
      imageUrl,
      instructions,
      ingredients: ingredients.filter((i) => i.trim() !== ''),
    };

    try {
      const response = await fetch(`http://localhost:5000/api/user-recipes/${recipeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedRecipe),
      });

      const data = await response.json();

      if (data.success) {
        alert('Recipe updated successfully!');
        navigate(`/recipes`);
      } else {
        alert('Failed to update recipe');
      }
    } catch (error) {
      console.error('Error updating recipe:', error);
      alert('Server error while updating recipe');
    }
  };

  return (
    <div className="add-recipe-container">
      <h1>Edit Recipe</h1>
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

        <button type="submit">Update Recipe</button>
      </form>
    </div>
  );
};

export default EditRecipe;
