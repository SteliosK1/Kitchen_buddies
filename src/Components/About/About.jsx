import React from 'react';
import './About.css';

const About = () => {
    return (
        <div className="About">
            <div className="about-content">
                <h1 style={{ paddingBottom: '10px' }}>About Us</h1>
                <p className="about-paragraph">
                    Welcome to Kitchen Buddies! We are two passionate friends who love cooking simple yet delicious recipes.
                    Our goal is to make cooking easy for everyone by offering recipes with minimal ingredients that anyone can follow.
                    We're students with a deep love for food, and we want to share our passion with you!
                </p>

                <h2>Our Story</h2>
                <p className="about-paragraph">
                    Kitchen Buddies was born out of a shared love for cooking and a desire to make meals that are easy, fun, and accessible for everyone.
                    We wanted to create a space where people can find simple recipes that don’t require complex ingredients or cooking skills.
                    Whether you're a beginner in the kitchen or just looking for a quick meal, we've got you covered!
                </p>

                <h2>Our Vision</h2>
                <p className="about-paragraph">
                    Our vision is to inspire and empower people to cook at home, eat healthier, and explore new flavors without the stress of complicated recipes.
                    Cooking should be fun, not overwhelming!
                </p>
            </div>
        </div>
    );
};

export default About;