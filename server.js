const express = require('express');
const path = require('path');
const fs = require('fs').promises; // Use promises for non-blocking I/O
const showdown = require('showdown');
const app = express();
const port = 8053;

app.use(express.static('public'));
app.use(express.static('data'));
app.use(express.json());

const ensureDirectoryExists = async dirPath => {
    try {
        await fs.access(dirPath);
    } catch (err) {
        await fs.mkdir(dirPath, { recursive: true });
    }
};

const users = {
    Admin: { username: 'admin', password: 'admin123' },
    Diskusan: [
        { username: 'diskusan1', password: 'diskusan123' },
        { username: 'diskusan2', password: 'diskusan123' }
    ],
    Perumus: { username: 'perumus', password: 'perumus123' },
    Mushahih: { username: 'mushahih', password: 'mushahih123' }
};

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    console.log(`Received login request for username: ${username}`);

    let userType = null;
    if (users.Admin.username === username && users.Admin.password === password) {
        userType = 'Admin';
    } else if (users.Perumus.username === username && users.Perumus.password === password) {
        userType = 'Perumus';
    } else if (users.Mushahih.username === username && users.Mushahih.password === password) {
        userType = 'Mushahih';
    } else if (users.Diskusan.some(user => user.username === username && user.password === password)) {
        userType = 'Diskusan';
    }

    if (userType) {
        res.status(200).json({ userType });
    } else {
        res.status(401).send('Invalid username or password');
    }
});

app.get('/data/:folderName', async (req, res) => {
    const folderName = req.params.folderName;
    const folderPath = path.join(__dirname, 'data', folderName);

    try {
        const stats = await fs.stat(folderPath);
        if (!stats.isDirectory()) {
            return res.status(400).send('Not a directory');
        }

        const files = await fs.readdir(folderPath);
        console.log(`Files found: ${files}`);
        res.json(files.filter(file => file.endsWith('.md')));
    } catch (err) {
        console.error(`Error accessing directory: ${err}`);
        res.status(500).send('Unable to access directory: ' + err);
    }
});

app.get('/data/:folderName/:fileName', async (req, res) => {
    const folderName = req.params.folderName;
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, 'data', folderName, fileName);

    try {
        await fs.access(filePath, fs.constants.F_OK);
        const data = await fs.readFile(filePath, 'utf8');
        res.send(data);
    } catch (err) {
        console.error(`Error reading file: ${err}`);
        res.status(404).send('File not found');
    }
});

const saveContent = async (req, res, folder, fileName, contentKey = 'content') => {
    const content = req.body[contentKey];

    if (!content) {
        return res.status(400).json({ error: 'Content is required' });
    }

    const filePath = path.join(__dirname, 'data', folder, fileName);
    await ensureDirectoryExists(path.dirname(filePath));

    try {
        await fs.writeFile(filePath, content, 'utf8');
        res.status(200).json({ message: `${folder} saved successfully` });
    } catch (err) {
        console.error(`Error saving ${folder}:`, err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

app.post('/save-paparan', (req, res) => saveContent(req, res, 'paparan', 'paparan.md'));
app.post('/save-pandangan-awal', (req, res) => saveContent(req, res, 'pandangan-awal', `pandangan-awal-${req.body.username}.md`, 'content'));
app.post('/save-sanggahan', (req, res) => saveContent(req, res, 'sanggahan', `sanggahan-${req.body.username}.md`, 'content'));
app.post('/save-izin-sanggahan', (req, res) => saveContent(req, res, 'izin-sanggahan', `izin-sanggahan-${req.body.username}.md`, 'content'));
app.post('/save-jawaban', (req, res) => saveContent(req, res, 'jawaban', `jawaban-${req.body.username}.md`, 'content'));
app.post('/save-rumusan', (req, res) => saveContent(req, res, 'rumusan', 'rumusan.md'));
app.post('/save-tashih', (req, res) => saveContent(req, res, 'tashih', 'tashih.md'));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});