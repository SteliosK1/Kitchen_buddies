import React from 'react'
import './Navbar.css'

const Navbar = () => {
    return (
      <div className="navbar">
        <div className="icon">
          <a href="/" className="logo-link">
            <h2 className="logo">
              Kitchen
              <div style={{ paddingLeft: "20px" }}>Buddies</div>
            </h2>
          </a>
        </div>
  
        <div className="menu">
          <ul>
            <li><a href="/About">ABOUT</a></li>
            <li><a href="/recipes">RECIPES</a></li>
            <li><a href="/contact">CONTACT</a></li>
          </ul>
        </div>
      </div>
    );
  };
  

export default Navbar
