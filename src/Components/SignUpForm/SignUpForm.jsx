import React, { useState } from 'react';
import '../SignUpForm/SignUpForm.css'; // Corrected the import path

const SignupForm = ({ onSwitchToLogin }) => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Registration successful! You can now log in.');
        onSwitchToLogin(); // Switch to login form after success
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <form className="signup-form" onSubmit={handleSignup}>
      <h2>Sign Up Here</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <input
        type="text"
        name="username"
        placeholder="Enter Username Here"
        value={fullname}
        onChange={(e) => setFullname(e.target.value)}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Enter Email Here"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        name="password"
        placeholder="Enter Password Here"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password Here"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      <button type="submit" className="signup-btnn">
        <a href="#" onClick={(e) => e.preventDefault()}>Sign Up</a>
      </button>

      <p className="link">
        Already have an account? <br />
        <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>Login</a> here
      </p>
    </form>
  );
};

export default SignupForm;
