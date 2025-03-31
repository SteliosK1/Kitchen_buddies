import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Contact.css'; // Assuming you have a CSS file for styling

const Contact = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    message: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      mobile: '',
      message: '',
    }); // Clear the form
    navigate('/contact?success=true'); // Redirect with success message in URL
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <h1>Contact Us Form</h1>
        <input
          type="text"
          id="firstName"
          placeholder="First Name"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          id="lastName"
          placeholder="Last Name"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          id="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          id="mobile"
          placeholder="Mobile"
          value={formData.mobile}
          onChange={handleChange}
          pattern='[0-9]*'
          required
        />
        <h4>Type Your Message Here...</h4>
        <textarea
          id="message"
          placeholder="Your Message"
          value={formData.message}
          onChange={handleChange}
          required
        ></textarea>
        <input type="submit" value="Send" id="button" />
      </form>
    </div>
  );
};

export default Contact;