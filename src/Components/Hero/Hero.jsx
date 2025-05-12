import React from 'react';
import './Hero.css';

const Hero = () => {
  const handleJoinUsClick = () => {
    console.log('stelios');
  };

  return (
    <div className="hero">
      <div className="hero-text">
        <h1 className="h1">
          Welcome to our<br />
          <span>Kitchen, Buddy!!</span>
          <br />
        </h1>

        <p className="par">
          We are two friends with special recipes for you.<br />
          It's easy to cook with us because we don't have a lot of ingredients for the recipes!
          <br />
          We are students! SORRY!
        </p>
      </div>
    </div>
  );
};

export default Hero;