import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import morgan from 'morgan';
import cors from 'cors';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your_secret_key';


const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

// MySQL Connection
const db = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'kitchen_buddies',
});

// Δημιουργία πίνακα (αν δεν υπάρχει)
await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullname VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL
    )
`);

// Routes
app.get('/', (req, res) => {
    res.send('Καλώς ήρθες στο backend με MySQL!');
});

// Εγγραφή χρήστη
app.post('/api/register', async (req, res) => {
    const { fullname, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute(
            'INSERT INTO users (fullname, email, password) VALUES (?, ?, ?)',
            [fullname, email, hashedPassword]
        );
        res.json({ success: true, message: 'Ο χρήστης δημιουργήθηκε!' });
    } catch (error) {
        console.error('Σφάλμα εγγραφής:', error);
        res.status(500).json({ success: false, message: 'Σφάλμα διακομιστή ή διπλό email' });
    }
});

// Σύνδεση χρήστη
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        // Δημιουργία JWT token
        const token = jwt.sign(
            { id: user.id, fullname: user.fullname, email: user.email },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                fullname: user.fullname,
                email: user.email,
                phone: user.phone || '',
                address: user.address || '',
                bio: user.bio || '',
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Ενημέρωση προφίλ χρήστη
app.put('/api/update-profile', async (req, res) => {
    const { fullname, email, phone, address, bio } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Δεν βρέθηκε το token. Παρακαλώ συνδεθείτε.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        // Ενημέρωση των στοιχείων του χρήστη στη βάση
        const [result] = await db.execute(
            'UPDATE users SET fullname = ?, email = ?, phone = ?, address = ?, bio = ? WHERE id = ?',
            [fullname, email, phone, address, bio, userId]
        );

        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Τα στοιχεία ενημερώθηκαν επιτυχώς!' });
        } else {
            res.status(400).json({ success: false, message: 'Δεν βρέθηκαν δεδομένα για τον χρήστη.' });
        }
    } catch (error) {
        console.error('Σφάλμα κατά την ενημέρωση:', error);
        res.status(500).json({ success: false, message: 'Σφάλμα διακομιστή' });
    }
});

app.get('/api/favorites', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        const [rows] = await db.execute('SELECT recipe_id FROM favorites WHERE user_id = ?', [userId]);
        const recipeIds = rows.map(row => row.recipe_id);
        res.json({ success: true, favorites: recipeIds });
    } catch (error) {
        console.error('Error getting favorites:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/favorites/add', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const { recipeId } = req.body;

    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        await db.execute('INSERT INTO favorites (user_id, recipe_id) VALUES (?, ?)', [userId, recipeId]);
        res.status(201).json({ success: true, message: 'Added to favorites' });
    } catch (error) {
        console.error('Error adding to favorites:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


app.delete('/api/favorites/rm', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const { recipeId } = req.body;

    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        await db.execute('DELETE FROM favorites WHERE user_id = ? AND recipe_id = ?', [userId, recipeId]);
        res.json({ success: true, message: 'Removed from favorites' });
    } catch (error) {
        console.error('Error removing from favorites:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Αφαίρεσε αυτή τη διαδρομή αν δεν χρησιμοποιείται
app.post('/api/user-recipes/add', async (req, res) => {
  try {
    res.status(201).json({ success: true, message: 'Recipe created' });
  } catch (error) {
    console.error('Error adding recipe:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.post('/api/user-recipes', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const { title, imageUrl, instructions, ingredients, cookTime, rating } = req.body;

    // Εισαγωγή της συνταγής στη βάση δεδομένων
    await db.execute(
      'INSERT INTO user_recipes (user_id, title, image, instructions, ingredients, cook_time, rating) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, title, imageUrl, instructions, JSON.stringify(ingredients), cookTime, rating]
    );

    res.status(201).json({ success: true, message: 'Recipe added successfully!' });
  } catch (error) {
    console.error('Error adding recipe:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/user-recipes', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM user_recipes');
    res.json({ success: true, recipes: rows });
  } catch (error) {
    console.error('Error getting user recipes:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/user-recipes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute('SELECT * FROM user_recipes WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Recipe not found' });
    res.json({ success: true, recipe: rows[0] });
  } catch (error) {
    console.error('Error getting user recipe:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// Εκκίνηση διακομιστή
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
