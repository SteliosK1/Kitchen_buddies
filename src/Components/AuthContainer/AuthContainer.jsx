import React, { useState } from 'react';
import LoginForm from '../LoginForm/LoginForm';
import SignupForm from '../SignUpForm/SignUpForm';
import './AuthContainer.css';

const AuthContainer = () => {
  const [isLogin, setIsLogin] = useState(true);

  const switchToSignup = () => setIsLogin(false);
  const switchToLogin = () => setIsLogin(true);

  const handleForgotPassword = () => {
    alert('Redirecting to Forgot Password page...');
    // Εδώ μπορείς να κάνεις redirect σε μια νέα σελίδα ή να εμφανίσεις modal
    // π.χ., window.location.href = '/forgot-password';
  };

  return (
    <div className="form-container">
      <button onClick={switchToSignup} className="toggle-button">
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