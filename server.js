const express = require('express');
const path = require('path');
const fs = require('fs');
const showdown = require('showdown');
const app = express();
const port = 3000;

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
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        const { username, password } = JSON.parse(body);

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
});

app.get('/data/:folderName', (req, res) => {
    const folderName = req.params.folderName;
    const folderPath = path.join(__dirname, 'data', folderName);
    console.log(`Scanning directory: ${folderPath}`);
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error(`Error scanning directory: ${err}`);
            return res.status(500).send('Unable to scan directory: ' + err);
        }
        console.log(`Files found: ${files}`);
        res.json(files.filter(file => file.endsWith('.md')));
    });
});

app.get('/data/:folderName/:fileName', (req, res) => {
    const folderName = req.params.folderName;
    const fileName = req.params.fileName;
    const filePath = path.join(__dirname, 'data', folderName, fileName);
    console.log(`Reading file: ${filePath}`);
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file: ${err}`);
            return res.status(500).send('Error reading file: ' + err);
        }
        console.log(`File read successfully: ${fileName}`);
        res.send(data);
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});