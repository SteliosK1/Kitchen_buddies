import React from 'react';
import './SevenDaysProgram.css';

const days = [
  'Day 1: Healthy Breakfast',
  'Day 2: Light Lunch',
  'Day 3: Protein Power',
  'Day 4: Veggie Day',
  'Day 5: Mediterranean',
  'Day 6: Cheat Meal',
  'Day 7: Family Dinner',
];

const SevenDaysProgram = () => {
  return (
    <div className="seven-days-container">
      <h1>7 Days Program</h1>
      <p className="seven-days-intro">
        Welcome to your 7-day meal plan! Discover a new recipe for each day and enjoy healthy, tasty meals all week.
      </p>
      <ul className="seven-days-list">
        {days.map((desc, idx) => (
          <li key={idx} className="seven-days-item">
            <span className="day-number">{idx + 1}</span>
            <span className="day-desc">{desc}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SevenDaysProgram;