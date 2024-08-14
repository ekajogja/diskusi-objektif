const express = require('express');
const path = require('path');
const fs = require('fs');
const showdown = require('showdown');
const app = express();
const port = 8053;

app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static('public'));
app.use(express.static('data'));

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

app.get('/data/:folderName', (req, res) => {
    const folderName = req.params.folderName;
    const folderPath = path.join(__dirname, 'data', folderName);

    fs.stat(folderPath, (err, stats) => {
        if (err) {
            console.error(`Error stating directory: ${err}`);
            return res.status(500).send('Unable to stat directory: ' + err);
        }

        if (!stats.isDirectory()) {
            console.error(`Path is not a directory: ${folderPath}`);
            return res.status(400).send('Not a directory');
        }

        fs.readdir(folderPath, (err, files) => {
            if (err) {
                console.error(`Error scanning directory: ${err}`);
                return res.status(500).send('Unable to scan directory: ' + err);
            }
            console.log(`Files found: ${files}`);
            res.json(files.filter(file => file.endsWith('.md')));
        });
    });
});

// Route to serve individual markdown files
app.get('/data/:folderName/:fileName', (req, res) => {
    const folderName = req.params.folderName;
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, 'data', folderName, fileName);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Unable to read file: ' + err);
        }
        res.send(data);
    });
});

// Route to save Paparan content
app.post('/save-paparan', (req, res) => {
    const { content } = req.body;

    if (!content) {
        return res.status(400).json({ error: 'Content is required' });
    }

    const filePath = path.join(__dirname, 'data', 'paparan', 'paparan.md');

    fs.writeFile(filePath, content, 'utf8', err => {
        if (err) {
            console.error('Error saving Paparan:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.status(200).json({ message: 'Paparan saved successfully' });
    });
});

// Route to save Pandangan Awal content
app.post('/save-pandangan-awal', (req, res) => {
    const { content, userName } = req.body;

    if (!userName) {
        return res.status(400).send('Username is required');
    }

    const filePath = path.join(__dirname, 'data', 'pandangan-awal', `pandangan-awal-${userName}.md`);

    fs.writeFile(filePath, content, 'utf8', err => {
        if (err) {
            console.error('Error saving Pandangan Awal:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.status(200).json({ message: 'Pandangan Awal saved successfully' });
    });
});

// Route to save Sanggahan content
app.post('/save-sanggahan', (req, res) => {
    const { content, userName } = req.body;

    if (!userName) {
        return res.status(400).send('Username is required');
    }

    const filePath = path.join(__dirname, 'data', 'sanggahan', `sanggahan-${userName}.md`);

    fs.writeFile(filePath, content, 'utf8', err => {
        if (err) {
            console.error('Error saving Sanggahan:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.status(200).json({ message: 'Sanggahan saved successfully' });
    });
});

// Route to save Izin Sanggahan content
app.post('/save-izin-sanggahan', (req, res) => {
    const { content, userName } = req.body;

    if (!userName) {
        return res.status(400).send('Username is required');
    }

    const filePath = path.join(__dirname, 'data', 'izin-sanggahan', `izin-sanggahan-${userName}.md`);

    fs.writeFile(filePath, content, 'utf8', err => {
        if (err) {
            console.error('Error saving Izin Sanggahan:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.status(200).json({ message: 'Izin Sanggahan saved successfully' });
    });
});

// Route to save Jawaban content
app.post('/save-jawaban', (req, res) => {
    const { content, userName } = req.body;

    if (!userName) {
        return res.status(400).send('Username is required');
    }

    const filePath = path.join(__dirname, 'data', 'jawaban', `jawaban-${userName}.md`);

    fs.writeFile(filePath, content, 'utf8', err => {
        if (err) {
            console.error('Error saving Jawaban:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.status(200).json({ message: 'Jawaban saved successfully' });
    });
});

// Route to save Rumusan content
app.post('/save-rumusan', (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        const { content } = JSON.parse(body);
        const filePath = path.join(__dirname, 'data', 'rumusan', 'rumusan.md');

        fs.writeFile(filePath, content, 'utf8', err => {
            if (err) {
                console.error('Error saving Rumusan:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.status(200).json({ message: 'Rumusan saved successfully' });
        });
    });
});

// Route to save Tashih content
app.post('/save-tashih', (req, res) => {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        const { content } = JSON.parse(body);
        const filePath = path.join(__dirname, 'data', 'tashih', 'tashih.md');

        fs.writeFile(filePath, content, 'utf8', err => {
            if (err) {
                console.error('Error saving Tashih:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.status(200).json({ message: 'Tashih saved successfully' });
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
