import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const ResetPassword = () => {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (data.success) {
        setMsg('Ο κωδικός άλλαξε επιτυχώς!');
      } else {
        setMsg(data.message || 'Σφάλμα.');
      }
    } catch {
      setMsg('Σφάλμα σύνδεσης με τον διακομιστή.');
    }
    setLoading(false);
  };

  return (
    <div className="form">
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Enter new password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : 'Reset Password'}
        </button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
};

export default ResetPassword;