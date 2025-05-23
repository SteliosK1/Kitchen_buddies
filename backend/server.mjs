import express from 'express';
import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import morgan from 'morgan';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch'; 
import nodemailer from 'nodemailer';
import multer from 'multer';
import path from 'path';

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

await db.execute(`
  CREATE TABLE IF NOT EXISTS comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id VARCHAR(20),
    user_id INT,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (recipe_id) REFERENCES external_recipes(id)
)
`);

// Ρύθμιση αποθήκευσης εικόνων
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Βεβαιώσου ότι υπάρχει ο φάκελος uploads
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });
app.use('/uploads', express.static('uploads'));

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
        console.log('rows:', rows);
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
    let recipeId = req.body.recipeId || req.params.recipeId;
    if (/^\d+$/.test(recipeId)) {
        // external recipe, κράτα ως έχει
    } else {
        // handle error
        return res.status(400).json({ success: false, message: 'Invalid recipeId' });
    }
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
    let recipeId = req.body.recipeId || req.params.recipeId;
    if (/^\d+$/.test(recipeId)) {
        // external recipe, κράτα ως έχει
    } else {
        // handle error
        return res.status(400).json({ success: false, message: 'Invalid recipeId' });
    }
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
app.post('/api/user-recipes/add', upload.single('image'), async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.id;

    const { title, instructions, ingredients } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.imageUrl || '';

    await db.execute(
      'INSERT INTO user_recipes (user_id, title, image, instructions, ingredients) VALUES (?, ?, ?, ?, ?)',
      [userId, title, imageUrl, instructions, JSON.stringify(JSON.parse(ingredients))]
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
    res.json({ success: true, recipe: rows[0] }); // <-- περιέχει και το user_id τώρα
  } catch (error) {
    console.error('Error getting user recipe:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Επεξεργασία συνταγής
app.put('/api/user-recipes/:id', async (req, res) => {
    const { id } = req.params;
    const { title, imageUrl, instructions, ingredients } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Δεν βρέθηκε το token. Παρακαλώ συνδεθείτε.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        // Ενημέρωση της συνταγής στη βάση δεδομένων
        const [result] = await db.execute(
            'UPDATE user_recipes SET title = ?, image = ?, instructions = ?, ingredients = ? WHERE id = ? AND user_id = ?',
            [title, imageUrl, instructions, JSON.stringify(ingredients), id, userId]
        );

        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Η συνταγή ενημερώθηκε επιτυχώς!' });
        } else {
            res.status(400).json({ success: false, message: 'Δεν βρέθηκε η συνταγή ή δεν ανήκει στον χρήστη.' });
        }
    } catch (error) {
        console.error('Σφάλμα κατά την επεξεργασία συνταγής:', error);
        res.status(500).json({ success: false, message: 'Σφάλμα διακομιστή' });
    }
});

// Διαγραφή συνταγής
app.delete('/api/user-recipes/:id', async (req, res) => {
    const { id } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'Δεν βρέθηκε το token. Παρακαλώ συνδεθείτε.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        // Διαγραφή της συνταγής από τη βάση δεδομένων
        const [result] = await db.execute(
            'DELETE FROM user_recipes WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Η συνταγή διαγράφηκε επιτυχώς!' });
        } else {
            res.status(400).json({ success: false, message: 'Δεν βρέθηκε η συνταγή ή δεν ανήκει στον χρήστη.' });
        }
    } catch (error) {
        console.error('Σφάλμα κατά τη διαγραφή συνταγής:', error);
        res.status(500).json({ success: false, message: 'Σφάλμα διακομιστή' });
    }
});

// Ratings με υποστήριξη API συνταγών
app.post('/api/ratings', async (req, res) => {
    let recipeId = req.body.recipeId || req.params.recipeId;
    if (/^\d+$/.test(recipeId)) {
        // external recipe, κράτα ως έχει
    } else {
        // handle error
        return res.status(400).json({ message: 'Invalid recipeId.' });
    }
    let { userId, rating } = req.body;
    userId = Number(userId);
    rating = Number(rating);
    if (!userId || !recipeId || isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Missing or invalid data.' });
    }

    try {
        // Έλεγχος αν υπάρχει ο χρήστης
        const [userRows] = await db.execute('SELECT id FROM users WHERE id = ?', [userId]);
        if (userRows.length === 0) {
            return res.status(400).json({ message: 'User does not exist.' });
        }

        const [userRecipeRows] = await db.execute('SELECT id FROM user_recipes WHERE id = ?', [recipeId]);
        const [externalRecipeRows] = await db.execute('SELECT id FROM external_recipes WHERE id = ?', [recipeId]);

        if (userRecipeRows.length === 0 && externalRecipeRows.length === 0) {
            // ...εισαγωγή συνταγής από API...
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
    let recipeId = req.params.recipeId;
    if (/^\d+$/.test(recipeId)) {
        // external recipe, κράτα ως έχει
    } else {
        // handle error
        return res.status(400).json({ message: 'Invalid recipeId.' });
    }
    const { userId } = req.query;
    try {
        // Average rating
        const [rows] = await db.execute(
            'SELECT AVG(rating) as avgRating FROM ratings WHERE recipe_id = ?',
            [recipeId]
        );
        let userRating = null;
        if (userId) {
            const parsedUserId = Number(userId);
            if (!parsedUserId) {
                return res.status(400).json({ message: 'Invalid userId.' });
            }
            const [userRows] = await db.execute(
                'SELECT rating FROM ratings WHERE recipe_id = ? AND user_id = ?',
                [recipeId, parsedUserId]
            );
            if (userRows.length > 0) {
                userRating = userRows[0].rating;
            }
        }
        console.log('Average:', rows[0].avgRating, 'User:', userRating);
        res.json({
            success: true,
            averageRating: rows[0].avgRating || 0,
            userRating
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error.' });
    }
});

app.get('/api/leaderboard', async (req, res) => {
    try {
        const [rows] = await db.execute(`
            SELECT 
                recipe_id, 
                AVG(rating) as avgRating, 
                COUNT(*) as ratingsCount
            FROM ratings
            GROUP BY recipe_id
            HAVING ratingsCount > 0
            ORDER BY avgRating DESC, ratingsCount DESC
            LIMIT 10
        `);

        // Χρησιμοποίησε Promise.all για να περιμένεις όλα τα async fetches
        const leaderboard = await Promise.all(rows.map(async (row) => {
            let title = '';
            let image = '';
            const recipeIdStr = String(row.recipe_id);
            // Δοκίμασε να βρεις στη βάση
            const [extRows] = await db.execute('SELECT title, image_url as image FROM external_recipes WHERE id = ?', [recipeIdStr]);
            if (extRows.length > 0) {
                title = extRows[0].title;
                image = extRows[0].image;
            } else {
                // Φέρε από το API αν δεν υπάρχει στη βάση
                const apiRes = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeIdStr}`);
                const apiData = await apiRes.json();
                if (apiData.meals && apiData.meals.length > 0) {
                    title = apiData.meals[0].strMeal;
                    image = apiData.meals[0].strMealThumb;
                }
            }
            return {
                id: recipeIdStr,
                title,
                image,
                avgRating: Number(row.avgRating),
                ratingsCount: row.ratingsCount
            };
        }));

        const filteredLeaderboard = leaderboard.filter(item => item.title && item.title.trim() !== '');
        res.json({ success: true, leaderboard: filteredLeaderboard });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Ρύθμισε το transporter (δοκιμαστικά με Gmail, βάλε τα δικά σου στοιχεία)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'int02476@uoi.gr',
        pass: 'alqdjcwjjnnxpsur'
    }
});

// Forgot password endpoint
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Απαιτείται email.' });

    try {
        // Βρες τον χρήστη
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (!users.length) {
            // Για λόγους ασφαλείας, απάντησε πάντα το ίδιο μήνυμα
            return res.json({ success: true, message: 'Αν υπάρχει ο λογαριασμός, στάλθηκε email επαναφοράς.' });
        }

        const user = users[0];
        // Δημιούργησε token (λήγει σε 1 ώρα)
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });
        const resetUrl = `http://localhost:5173/reset-password/${token}`;

        // Στείλε email
        await transporter.sendMail({
            from: '"Kitchen Buddies" <int02476@uoi.gr>',
            to: email,
            subject: 'Ανάκτηση Κωδικού',
            html: `
                <p>Κάνε κλικ στον παρακάτω σύνδεσμο για να αλλάξεις τον κωδικό σου:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>Ο σύνδεσμος ισχύει για 1 ώρα.</p>
            `
        });

        res.json({ success: true, message: 'Αν υπάρχει ο λογαριασμός, στάλθηκε email επαναφοράς.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Σφάλμα διακομιστή.' });
    }
});

app.post('/api/reset-password', async (req, res) => {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ success: false, message: 'Missing data.' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, decoded.userId]);
        res.json({ success: true, message: 'Password updated successfully!' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(400).json({ success: false, message: 'Invalid or expired token.' });
    }
});

// --- Comments Endpoints ---

// Get comments for a recipe
app.get('/api/comments/:recipeId', async (req, res) => {
    const { recipeId } = req.params;
    try {
        const [rows] = await db.execute(
            `SELECT comments.*, users.fullname FROM comments 
             JOIN users ON comments.user_id = users.id 
             WHERE recipe_id = ? ORDER BY created_at DESC`, 
            [recipeId]
        );
        res.json({ success: true, comments: rows });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Add a comment to a recipe (only for logged-in users)
app.post('/api/comments/:recipeId', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;
        const { recipeId } = req.params;
        const { comment } = req.body;
        if (!comment || !comment.trim()) {
            return res.status(400).json({ success: false, message: 'Comment cannot be empty' });
        }
        await db.execute(
            'INSERT INTO comments (recipe_id, user_id, comment) VALUES (?, ?, ?)',
            [recipeId, userId, comment]
        );
        res.json({ success: true, message: 'Comment added!' });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Διαγραφή σχολίου
app.delete('/api/comments/:commentId', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;
        const { commentId } = req.params;

        // Διαγράφει μόνο αν το σχόλιο ανήκει στον χρήστη
        const [result] = await db.execute(
            'DELETE FROM comments WHERE id = ? AND user_id = ?',
            [commentId, userId]
        );
        if (result.affectedRows > 0) {
            res.json({ success: true, message: 'Comment deleted!' });
        } else {
            res.status(403).json({ success: false, message: 'Not allowed to delete this comment.' });
        }
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Εκκίνηση διακομιστή
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
