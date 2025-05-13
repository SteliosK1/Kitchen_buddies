import React, { useState, useEffect } from 'react';
import LoginForm from '../LoginForm/LoginForm';
import SignupForm from '../SignUpForm/SignUpForm';
import './AuthContainer.css';

const AuthContainer = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Ελέγχουμε αν υπάρχει token στο localStorage
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token); // Αν υπάρχει token, ο χρήστης είναι συνδεδεμένος
  }, []);

  const switchToSignup = () => setIsLogin(false);
  const switchToLogin = () => setIsLogin(true);

  const handleForgotPassword = () => {
    alert('Redirecting to Forgot Password page...');
    // Εδώ μπορείς να κάνεις redirect σε μια νέα σελίδα ή να εμφανίσεις modal
    // π.χ., window.location.href = '/forgot-password';
  };

  return (
    <div className="form-container">
      <button
        onClick={!isLoggedIn ? switchToSignup : null} // Απενεργοποιούμε τη λειτουργία αν είναι συνδεδεμένος
        className="toggle-button"
        disabled={isLoggedIn} // Απενεργοποιούμε το κουμπί
        style={{
          cursor: isLoggedIn ? 'not-allowed' : 'pointer',
          opacity: isLoggedIn ? 0.5 : 1,
        }}
      >
        JOIN US
      </button>
      {isLogin ? (
        <LoginForm onSwitchToSignup={switchToSignup} onForgotPassword={handleForgotPassword} />
      ) : (
        <SignupForm onSwitchToLogin={switchToLogin} />
      )}
    </div>
  );
};

export default AuthContainer;