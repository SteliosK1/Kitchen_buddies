import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
};

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      return;
    }

    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      setFormData(storedUser);
    }
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveClick = async () => {
    if (!/^\d{10}$/.test(formData.phone)) {
      alert('The phone must contain exactly 10 numbers.');
      return;
    }

    if (formData.fullname.trim() === '') {
      alert('The name cannot be empty.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      alert('The email must be a valid email address.');
      return;
    }

    try {
      const response = await fetch('/api/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          fullname: formData.fullname,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          bio: formData.bio,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(formData);
        localStorage.setItem(
          'user',
          JSON.stringify({
            ...user,
            fullname: formData.fullname,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            bio: formData.bio,
          })
        );
        setIsEditing(false);
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('There was a problem updating your profile.');
    }
  };

  if (!token) {
    return (
      <div className="not-logged-in">
        <div className="overlay">
          <p className="not-logged-in-message">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (!user) {
     return (
      <div className="spinner-container">
        <div className="spinner"></div>
        <p className='loading-text'>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <h1>User Profile</h1>
      <div className="profile-card">
        <img
          src={user.profilePicture || '/chef.webp'}
          alt="Profile"
          className="profile-picture"
        />
        {isEditing ? (
          <div className="profile-form">
            <input
              type="text"
              id="fullname"
              name="fullname"
              value={formData.fullname}
              onChange={handleInputChange}
              placeholder="Full Name"
            />

            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
              required
              title="Please enter a valid email"
            />

            <input
              type="text"
              id="phone"
              name="phone"
              value={formData.phone || ''}
              onChange={handleInputChange}
              placeholder="Phone Number"
              maxLength="10"
              pattern="\d{10}"
              title="The phone number must contain exactly 10 digits"
            />

            <input
              type="text"
              id="address"
              name="address"
              value={formData.address || ''}
              onChange={handleInputChange}
              placeholder="Address"
            />

            <textarea
              id="bio"
              name="bio"
              value={formData.bio || ''}
              onChange={handleInputChange}
              placeholder="Write something about yourself"
            />

            <button onClick={handleSaveClick} className="save-button">
              Save
            </button>
          </div>
        ) : (
          <div className="profile-details">
            <h2>{user.fullname}</h2>
            <p>Email: {user.email}</p>
            <p>Phone: {user.phone || 'N/A'}</p>
            <p>Address: {user.address || 'N/A'}</p>
            <p>Bio: {user.bio || 'N/A'}</p>
            <button onClick={() => setIsEditing(true)} className="edit-button">
              Edit Profile
            </button>
          </div>
        )}
      </div>
      <button style={{ width: '100%', height: '40px' }} onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Profile;
