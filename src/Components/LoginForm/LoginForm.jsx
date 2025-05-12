import React, { useState } from 'react';
import './LoginForm.css';
//import axios from 'axios'; // Import axios for making HTTP requests
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faGoogle, faTwitter, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';

const isLoggedIn = localStorage.getItem('token') !== null;

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/'; // Ή όπου θέλεις να τον στείλεις
};
const LoginForm = ({ onSwitchToSignup, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
  e.preventDefault();
  setError('');

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json(); // ✅ ΜΟΝΟ μία φορά

    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      alert(`Login successful! Welcome ${data.user.fullname}`);
      window.location.href = '/profile';
    } else {
      setError(data.message); // Χρήση ήδη παρμένου `data`
    }
  } catch (err) {
    console.error('Error during login:', err);
    setError('An unexpected error occurred. Please try again.');
  }
};


if (isLoggedIn) {
    // Αν είναι συνδεδεμένος, κάνουμε redirect στο dashboard
    return (
      <div className="form">
        <h2>You are already logged in!</h2>
        <br />
        <p style={{ color: 'white' }}>Welcome back, {JSON.parse(localStorage.getItem('user')).fullname}!</p>
        <br />
        <button style={{ width: '100%', height: '40px' }} onClick={handleLogout}>Logout</button>

      </div>
    );
  } else {

  return (
    <div className="form" id="login-form">
      <h2>Login Here</h2>
      <input
        type="email"
        name="email"
        placeholder="Enter Email Here"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        name="password"
        placeholder="Enter Password Here"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="btnn" onClick={handleLogin}>
        Login
      </button>
      {error && <p style={{ color: 'white' }} className="error">{error}</p>} {/* Display error message */}

      <p className="link">
        <a href="#" onClick={onForgotPassword}>
          Forgot your password?
        </a>
      </p>

      <p className="link">
        Don't have an account? <br />
        <a href="#" onClick={onSwitchToSignup}>
          Sign up
        </a>{' '}
        here
      </p>
      <p className="liw">Log in with</p>
      <div className="social-icons">
        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faFacebook} size="2x" />
        </a>
        <a href="https://www.google.com" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faGoogle} size="2x" />
        </a>
        <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faTwitter} size="2x" />
        </a>
        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faInstagram} size="2x" />
        </a>
        <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
          <FontAwesomeIcon icon={faLinkedin} size="2x" />
        </a>
      </div>
    </div>
  );
};
};

export default LoginForm;