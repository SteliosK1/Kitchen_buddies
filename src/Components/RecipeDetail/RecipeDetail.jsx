import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFavorites } from '../../Context/FavoritesContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import './RecipeDetail.css';

const RecipeDetail = () => {
  const { recipeId } = useParams();
  const { favorites, toggleFavorite } = useFavorites();
  const [recipe, setRecipe] = useState(null);
  const [isUserRecipe, setIsUserRecipe] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const token = localStorage.getItem('token');
  const userId = token ? JSON.parse(atob(token.split('.')[1])).id : null;

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        if (/^\d{5,}$/.test(recipeId)) {
          const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`);
          const data = await response.json();
          if (data.meals && data.meals.length > 0) {
            const meal = data.meals[0];
            setRecipe({
              id: meal.idMeal,
              title: meal.strMeal,
              image: meal.strMealThumb,
              instructions: meal.strInstructions,
              ingredients: Array.from({ length: 20 }, (_, i) => meal[`strIngredient${i + 1}`]).filter(Boolean),
              rating: 4,
              isUesr: false,
            });
            setIsUserRecipe(false);
          }
        } else {
          const response = await fetch(`http://localhost:5000/api/user-recipes/${recipeId}`);
          const data = await response.json();
          if (data.success) {
            const r = data.recipe;
            setRecipe({
              id: r.id,
              title: r.title,
              image: r.image,
              instructions: r.instructions,
              ingredients: Array.isArray(r.ingredients) ? r.ingredients : JSON.parse(r.ingredients),
              rating: r.rating || 4,
              creatorId: r.user_id, // <--- Εδώ αποθηκεύουμε τον δημιουργό
              isUser: true,
            });
            setIsUserRecipe(true);
          }
        }
      } catch (error) {
        console.error('Error fetching recipe details:', error);
      }
    };

    const fetchRatings = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/ratings/${recipeId}?userId=${userId || ''}`);
        const data = await res.json();
        if (data.success) {
          setAverageRating(Number(data.averageRating) || 0);
          setUserRating(data.userRating); // μπορεί να είναι null
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    };

    const fetchComments = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/comments/${recipeId}`);
        const data = await res.json();
        if (data.success) {
          setComments(data.comments);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchRecipe();
    fetchRatings();
    fetchComments();
  }, [recipeId, userId]);

  const submitRating = async (rating) => {
    if (!userId) return;

    try {
      const res = await fetch('http://localhost:5000/api/ratings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, recipeId, rating }),
      });

      const data = await res.json();
      if (data.message === 'Rating saved!') {
        setUserRating(rating);
        // Φέρε ξανά το average από το backend
        const ratingsRes = await fetch(`http://localhost:5000/api/ratings/${recipeId}?userId=${userId}`);
        const ratingsData = await ratingsRes.json();
        if (ratingsData.success) {
          setAverageRating(Number(ratingsData.averageRating) || 0);
        }
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const handleDelete = async (recipeId) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this recipe?');
    if (confirmDelete) {
      try {
        const res = await fetch(`http://localhost:5000/api/user-recipes/${recipeId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          alert('Recipe deleted successfully!');
          navigate('/recipes');
        } else {
          alert('Error deleting the recipe');
        }
      } catch (error) {
        console.error('Error deleting recipe:', error);
        alert('Server error while deleting');
      }
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('You must be logged in to comment!');
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/comments/${recipeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ comment: newComment }),
      });
      const data = await res.json();
      if (data.success) {
        setNewComment('');
        // Φέρε ξανά τα σχόλια
        const res2 = await fetch(`http://localhost:5000/api/comments/${recipeId}`);
        const data2 = await res2.json();
        if (data2.success) setComments(data2.comments);
      } else {
        alert(data.message || 'Error adding comment');
      }
    } catch (err) {
      alert('Server error');
    }
  };

  const renderStars = (rating, onClick, hoverValue) => {
    const displayRating = hoverValue !== null ? hoverValue : rating;
    return [...Array(5)].map((_, index) => (
      <span
        key={index}
        className={`star ${index < displayRating ? 'filled' : ''}`}
        onMouseEnter={() => onClick && setHoveredStar(index + 1)}
        onMouseLeave={() => onClick && setHoveredStar(null)}
        onClick={() => onClick && onClick(index + 1)}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        ★
      </span>
    ));
  };

  if (!recipe) {
    return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p className='loading-text'>Loading recipes...</p>
      </div>
    );
  }

  console.log('averageRating:', averageRating);

  return (
    <div className="recipe-detail">
      {recipe.isUser && recipe.creatorId === userId && (
        <div className="recipe-actions">
          <Link to={`/edit-recipe/${recipe.id}`} className="edit-recipe-button">
            ✏️ Edit
          </Link>
          <button onClick={() => handleDelete(recipe.id)} className="delete-recipe-button">
            <FontAwesomeIcon icon={faTrash} /> Delete
          </button>
        </div>
      )}
      <h1>{recipe.title}</h1>
      <img
        src={
          recipe.image
            ? recipe.image.startsWith('/uploads/')
              ? `http://localhost:5000${recipe.image}`
              : recipe.image
            : '/default-image.jpg'
        }
        alt={recipe.title}
        className="recipe-image"
      />

      <div className="rating-section">
        <div className="average-rating">
          Average Rating: {typeof averageRating === 'number' && averageRating > 0 ? (
            averageRating.toFixed(2)
          ) : (
            'No ratings yet'
          )}
        </div>
        {userId && (
          <div className="user-rating">
            Your Rating: {renderStars(userRating || 0, submitRating, hoveredStar)}
          </div>
        )}
      </div>

      <div className="rating-and-favorite">
        <div className="favorite-icon" onClick={() => toggleFavorite(String(recipe.id))}>
          {favorites.includes(String(recipe.id)) ? '❤️' : '🤍'}
        </div>
      </div>

      <h2>Ingredients</h2>
      <ul>
        {recipe.ingredients.map((ing, index) => (
          <li key={index}>{ing}</li>
        ))}
      </ul>

      <h2>Steps</h2>
      <div className="instructions">{recipe.instructions}</div>

      <h2>Comments</h2>
      <div className="comments-section">
        {userId && (
          <form onSubmit={handleAddComment} className="comment-form">
            <textarea
              value={newComment}
              onChange={e => setNewComment(e.target.value)}
              placeholder="Write your comment..."
              rows={3}
              required
            />
            <button type="submit">Add Comment</button>
          </form>
        )}
        {comments.length === 0 && <p>No comments yet.</p>}
        <ul className="comments-list">
          {comments.map(c => (
            <li key={c.id}>
              <strong>{c.fullname}:</strong> {c.comment}
              <span style={{ color: '#aaa', marginLeft: 8, fontSize: '0.9em' }}>
                {new Date(c.created_at).toLocaleString()}
              </span>
              {/* Εμφάνιση κουμπιού διαγραφής μόνο για το δικό σου σχόλιο */}
              {userId === c.user_id && (
                <button
                  className="delete-comment-btn"
                  onClick={async () => {
                    if (window.confirm('Delete this comment?')) {
                      const res = await fetch(`http://localhost:5000/api/comments/${c.id}`, {
                        method: 'DELETE',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                        },
                      });
                      const data = await res.json();
                      if (data.success) {
                        setComments(comments.filter(com => com.id !== c.id));
                      } else {
                        alert(data.message || 'Error deleting comment');
                      }
                    }
                  }}
                  title="Delete"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default RecipeDetail;
