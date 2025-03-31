import React from 'react';
import './LoginForm.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faGoogle, faTwitter, faInstagram, faLinkedin } from '@fortawesome/free-brands-svg-icons';

const LoginForm = () => {
  return (
    <div className="form">
      <h2>Login Here</h2>
      <input type="email" name="email" placeholder="Enter Email Here" />
      <input type="password" name="password" placeholder="Enter Password Here" />
      <button className="btnn">
        <a href="#">Login</a>
      </button>

      <p className="link">
        Don't have an account? <br />
        <a href="#">Sign up</a> here
      </p>
      <p className="liw">Log in with</p>
      {/* Icons Section */}
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

export default LoginForm;