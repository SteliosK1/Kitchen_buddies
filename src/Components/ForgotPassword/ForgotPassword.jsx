import React, { useState } from 'react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('http://localhost:5000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Έγινε αποστολή email επαναφοράς (αν υπάρχει ο λογαριασμός).');
      } else {
        setMessage(data.message || 'Σφάλμα αποστολής email.');
      }
    } catch {
      setMessage('Σφάλμα σύνδεσης με τον διακομιστή.');
    }
    setLoading(false);
  };

  return (
    <div className="forgot-password-container">
      <h2>Ανάκτηση Κωδικού</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Το email σου"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Αποστολή...' : 'Αποστολή Email'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ForgotPassword;