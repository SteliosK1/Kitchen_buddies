import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import morgan from 'morgan';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch'; // Μην ξεχάσεις να το εγκαταστήσεις: npm i node-fetch

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

// Δημιουργία πινάκων
await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullname VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        address TEXT,
        bio TEXT
    )
`);

await db.execute(`
  CREATE TABLE IF NOT EXISTS favorites (
    user_id INT,
    recipe_id VARCHAR(20),
    PRIMARY KEY (user_id, recipe_id)
  )
`);

await db.execute(`
  CREATE TABLE IF NOT EXISTS user_recipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255),
    image TEXT,
    instructions TEXT,
    ingredients TEXT,
    cook_time VARCHAR(50),
    rating FLOAT
  )
`);

await db.execute(`
  CREATE TABLE IF NOT EXISTS external_recipes (
    id VARCHAR(20) PRIMARY KEY,
    title VARCHAR(255),
    image_url TEXT,
    instructions TEXT,
    ingredients TEXT
)
`);

await db.execute(`
  CREATE TABLE IF NOT EXISTS ratings (
    user_id INT,
    recipe_id VARCHAR(20),
    rating FLOAT,
    PRIMARY KEY (user_id, recipe_id)
  )
`);

// Routes
app.get('/', (req, res) => {
    res.send('Καλώς ήρθες στο backend με MySQL!');
});

// Εγγραφή
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

// Σύνδεση
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ success: false, message: 'Invalid email or password' });

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ success: false, message: 'Invalid email or password' });

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

// Ενημέρωση προφίλ
app.put('/api/update-profile', async (req, res) => {
    const { fullname, email, phone, address, bio } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'Δεν βρέθηκε το token' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

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

// Αγαπημένες συνταγές
app.get('/api/favorites', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;
        const [rows] = await db.execute('SELECT recipe_id FROM favorites WHERE user_id = ?', [userId]);
        res.json({ success: true, favorites: rows.map(row => row.recipe_id) });
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

// Συνταγές χρήστη
app.post('/api/user-recipes', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        const { title, imageUrl, instructions, ingredients, cookTime, rating } = req.body;
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

// Ratings με υποστήριξη API συνταγών
app.post('/api/ratings', async (req, res) => {
    const { userId, recipeId, rating } = req.body;
    if (!userId || !recipeId || !rating) {
        return res.status(400).json({ message: 'Missing data.' });
    }

    try {
        const [userRecipeRows] = await db.execute('SELECT id FROM user_recipes WHERE id = ?', [recipeId]);
        const [externalRecipeRows] = await db.execute('SELECT id FROM external_recipes WHERE id = ?', [recipeId]);

        if (userRecipeRows.length === 0 && externalRecipeRows.length === 0) {
            const apiRes = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`);
            const data = await apiRes.json();

            if (!data.meals || data.meals.length === 0) {
                return res.status(404).json({ message: 'Recipe not found in external API.' });
            }

            const meal = data.meals[0];
            const ingredients = [];

            for (let i = 1; i <= 20; i++) {
                const ingredient = meal[`strIngredient${i}`];
                const measure = meal[`strMeasure${i}`];
                if (ingredient && ingredient.trim()) {
                    ingredients.push(`${measure || ''} ${ingredient}`.trim());
                }
            }

            await db.execute(
                'INSERT INTO external_recipes (id, title, image_url, instructions, ingredients) VALUES (?, ?, ?, ?, ?)',
                [recipeId, meal.strMeal, meal.strMealThumb, meal.strInstructions, JSON.stringify(ingredients)]
            );
        }

        await db.execute(
            `INSERT INTO ratings (user_id, recipe_id, rating)
             VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE rating = VALUES(rating)`,
            [userId, recipeId, rating]
        );

        res.json({ message: 'Rating saved!' });
    } catch (err) {
        console.error('Error in rating route:', err);
        res.status(500).json({ message: 'Database error.' });
    }
});

app.get('/api/ratings/:recipeId', async (req, res) => {
    const { recipeId } = req.params;
    try {
        const [rows] = await db.execute(
            'SELECT AVG(rating) as avgRating FROM ratings WHERE recipe_id = ?',
            [recipeId]
        );
        res.json({ average: rows[0].avgRating || 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error.' });
    }
});

// Εκκίνηση διακομιστή
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
