import React, { useState, useEffect } from 'react';
import './Profile.css';

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/'; // Ή όπου θέλεις να τον στείλεις
};

const Profile = () => {
  // Ο χρήστης θα φορτωθεί από το localStorage
  const [user, setUser] = useState(null); // Χρησιμοποιούμε null αρχικά, γιατί τα δεδομένα θα φορτωθούν μετά
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(user);

  // Ελέγχουμε αν ο χρήστης είναι συνδεδεμένος (έχει token)
  const isLoggedIn = localStorage.getItem('token') !== null;

  useEffect(() => {
    if (!isLoggedIn) {
      alert('Πρέπει να συνδεθείτε για να δείτε το προφίλ!');
      window.location.href = '/';  // Ανακατεύθυνση στη σελίδα login αν δεν είναι συνδεδεμένος
    } else {
      // Φόρτωμα των στοιχείων του χρήστη από το localStorage
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser) {
        setUser(storedUser);  // Αποθήκευση των στοιχείων του χρήστη στο state
        setFormData(storedUser);  // Αποθήκευση και στα δεδομένα της φόρμας (για επεξεργασία)
      }
    }
  }, [isLoggedIn]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSaveClick = async () => {
    try {
      const response = await fetch('/api/update-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Στέλνουμε το token στο header
        },
        body: JSON.stringify({
          fullname: formData.fullname,
          email: formData.email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Αν η ενημέρωση είναι επιτυχής, αποθηκεύουμε τα δεδομένα στο localStorage
        setUser(formData);
        localStorage.setItem('user', JSON.stringify(formData));
        setIsEditing(false);
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error('Σφάλμα κατά την ενημέρωση:', err);
      alert('Υπήρξε πρόβλημα με την ενημέρωση των στοιχείων σας.');
    }
  };

  if (!user) {
    return <div>Loading...</div>; // Εμφάνιση κατά τη διάρκεια της φόρτωσης των δεδομένων
  }

  return (
    <div className="profile-container">
      <h1>User Profile</h1>
      <div className="profile-card">
        <img
          src={user.profilePicture || '/photo4.jpg'} // Αν δεν υπάρχει εικόνα, εμφανίζεται μία προεπιλεγμένη
          alt="Profile"
          className="profile-picture"
        />
        {isEditing ? (
          <div className="profile-form">
            <input
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleInputChange}
              placeholder="Full Name"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Email"
            />
            <button onClick={handleSaveClick} className="save-button">
              Save
            </button>
          </div>
        ) : (
          <div className="profile-details">
            <h2>
              {user.fullname}
            </h2>
            <p>Email: {user.email}</p>
            <br />
            <button onClick={handleEditClick} className="edit-button">
              Edit Profile
            </button>
          </div>
        )}
      </div>
       <button style={{ width: '100%', height: '40px' }} onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Profile;
