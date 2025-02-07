const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const corsOptions = {
    origin: 'https://r0man4uk.github.io', 
    methods: 'GET,POST',
    allowedHeaders: 'Content-Type'
};

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'scores.json');

app.use(express.json());
app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, 'public')));

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

app.get('/api/scores', (req, res) => {
    const data = JSON.parse(fs.readFileSync(DATA_FILE));
    res.json(data);
});

app.post('/api/scores', (req, res) => {
    const { name, moves, time } = req.body;

    if (!name || typeof moves !== 'number' || typeof time !== 'number') {
        return res.status(400).json({ error: 'Invalid data' });
    }

    const scores = JSON.parse(fs.readFileSync(DATA_FILE));
    scores.push({ name, moves, time });

    scores.sort((a, b) => a.moves - b.moves || a.time - b.time);

    const topScores = scores.slice(0, 10);  // Топ 10 результатів

    fs.writeFileSync(DATA_FILE, JSON.stringify(topScores, null, 2));
    res.status(201).json({ message: 'Score saved!' });
});

app.use('/images', express.static(path.join(__dirname, 'images')));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
