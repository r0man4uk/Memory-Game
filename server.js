const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'scores.json');

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

app.get('/api/scores', (req, res) => {                     // Get res
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    res.json(data);
});

app.post('/api/scores', (req, res) => {                    // Save res
    const { name, moves, time } = req.body;

    if (!name || typeof moves !== 'number' || typeof time !== 'number') {
        return res.status(400).json({ error: 'Invalidushka data' });
    }

    const scores = JSON.parse(fs.readFileSync(DATA_FILE));
    scores.push({ name, moves, time });

    scores.sort((a, b) => a.moves - b.moves || a.time - b.time);

    const topScores = scores.slice(0, 10);           // Top Scores => max 10

    fs.writeFileSync(DATA_FILE, JSON.stringify(topScores, null, 2));
    res.status(201).json({ message: 'Результат записано!' });
});

app.use('/images', express.static(path.join(__dirname, 'images')));

app.listen(PORT, () => {
    console.log(`Server is running on port ${process.env.PORT || 8080}`);
});
console.log("Running on port:", PORT);