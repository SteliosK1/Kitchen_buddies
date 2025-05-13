import React, { useState, useEffect } from 'react';
import './LoginForm.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faGoogle, faTwitter, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';

const isLoggedIn = localStorage.getItem('token') !== null;

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('lastVisit'); // Καθαρίζουμε την τελευταία επίσκεψη
  localStorage.removeItem('streak'); // Καθαρίζουμε το streak
  window.location.href = '/'; // Ή όπου θέλεις να τον στείλεις
};

const LoginForm = ({ onSwitchToSignup, onForgotPassword }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error] = useState('');
  const [streak, setStreak] = useState(0);

  const user = JSON.parse(localStorage.getItem('user')); // Παίρνουμε τα δεδομένα του χρήστη από το localStorage

  useEffect(() => {
    if (isLoggedIn) {
      const today = new Date().toISOString().split('T')[0]; // Παίρνουμε την τρέχουσα ημερομηνία (μόνο η ημερομηνία, χωρίς ώρα)
      const lastVisit = localStorage.getItem('lastVisit');
      let currentStreak = parseInt(localStorage.getItem('streak'), 10) || 0;

      if (lastVisit) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastVisit === yesterdayStr) {
          // Αν η τελευταία επίσκεψη ήταν χθες, αυξάνουμε το streak
          currentStreak += 1;
        } else if (lastVisit !== today) {
          // Αν η τελευταία επίσκεψη δεν ήταν σήμερα ή χθες, μηδενίζουμε το streak
          currentStreak = 1;
        }
      } else {
        // Αν δεν υπάρχει προηγούμενη επίσκεψη, ξεκινάμε το streak από 1
        currentStreak = 1;
      }

      // Αποθηκεύουμε την τρέχουσα ημερομηνία και το streak στο localStorage
      localStorage.setItem('lastVisit', today);
      localStorage.setItem('streak', currentStreak);

      // Ενημερώνουμε το state
      setStreak(currentStreak);
    }
  }, [isLoggedIn]);

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            alert(`Login successful! Welcome ${data.user.fullname}`);
            window.location.href = '/profile';
        } else {
            // Εμφάνιση μόνο alert για αποτυχία login
            alert('Login failed: Invalid email or password');
        }
    } catch (err) {
        console.error('Error during login:', err);
        alert('An unexpected error occurred. Please try again.');
    }
  };

  if (isLoggedIn) {
    // Αν είναι συνδεδεμένος, εμφανίζουμε περισσότερες πληροφορίες
    return (
      <div className="form">
        <h2>You are already logged in!</h2>
        <br />
        {/* Εικόνα χρήστη */}
        <img
          src={user.profilePicture || '/chef.webp'} // Default εικόνα αν δεν υπάρχει
          alt="User Avatar"
          className="user-avatar"
        />
        <br />
        <p style={{ color: 'white' }}>Welcome back, {user.fullname}!</p>
        <p style={{ color: 'white' }}>
          <br />You have logged in for <strong>{streak}</strong> consecutive day(s)!
        </p>
        <br />
        <button
          style={{ width: '100%', height: '40px' }}
          onClick={handleLogout}
        >
          Logout
        </button>
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
        {error && <p style={{ color: 'white' }} className="error">{error}</p>}

        <p className="link">
          Don't have an account? <br />
          <a href="#" onClick={onSwitchToSignup}>
            Sign up here
          </a>{' '}
          
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
  }
};

export default LoginForm;