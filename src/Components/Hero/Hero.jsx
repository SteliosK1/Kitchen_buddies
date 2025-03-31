import React from 'react'
import './Hero.css'

const Hero = () => {
  return (
    <div className="hero">
        <div className="hero-text">
          <h1 className="h1">Welcome to our<br/><span>Kitchen, Buddy!!</span><br></br></h1>
            
          <p className="par">
              We are two friends with special recipes for you.<br/>It's easy to cook with us because we dont have a lot of ingredients for the recipes!
                <br/>We are students! SORRY!
            </p>
            <button class="cn"><a href="">JOIN US</a></button>
        </div>
      
    </div>
  )
}

export default Hero