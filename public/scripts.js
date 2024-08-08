document.getElementById('login-button').addEventListener('click', async function() {
    const username = prompt("Enter username:");
    const password = prompt("Enter password:");

    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (response.status === 200) {
        const { userType } = await response.json();
        showMenuBasedOnUser(userType);
    } else {
        alert("Invalid username or password");
    }
});

function showMenuBasedOnUser(userType) {
    const menu = document.getElementById('menu');
    menu.innerHTML = '<a href="#" class="pure-button">Beranda</a>'; // Always show Beranda

    const buttons = [
        { text: 'Pandangan Awal', showFor: ['Admin', 'Diskusan', 'Perumus', 'Mushahih'] },
        { text: 'Sanggahan', showFor: ['Admin', 'Diskusan', 'Perumus', 'Mushahih'] },
        { text: 'Izin Sanggahan', showFor: ['Admin', 'Diskusan', 'Perumus', 'Mushahih'] },
        { text: 'Jawaban', showFor: ['Admin', 'Diskusan', 'Perumus', 'Mushahih'] },
        { text: 'Rumusan', showFor: ['Admin', 'Perumus', 'Mushahih'] },
        { text: 'Tashih', showFor: ['Admin', 'Mushahih'] },
        { text: 'Dasbor Admin', showFor: ['Admin'] }
    ];

    buttons.forEach(button => {
        if (button.showFor.includes(userType)) {
            const btn = document.createElement('a');
            btn.href = '#';
            btn.className = 'pure-button';
            btn.textContent = button.text;
            menu.appendChild(btn);
        }
    });

    const loginButton = document.createElement('a');
    loginButton.href = '#';
    loginButton.className = 'pure-button';
    loginButton.id = 'login-button';
    loginButton.textContent = 'Login';
    menu.appendChild(loginButton);
}


document.querySelectorAll('#collapsible-menu .pure-menu-link').forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault();
        const folderName = this.getAttribute('data-file');
        
        // Check if the requested path is a directory
        if (folderName && folderName.endsWith('.md')) {
            console.error('Requested path is a file, not a directory');
            return;
        }
        
        loadMarkdownFiles(folderName);
    });
});

async function loadMarkdownFiles(folderName) {
    const contentDiv = document.getElementById('markdown-content');
    contentDiv.innerHTML = '';

    const response = await fetch(`/data/${folderName}`);
    const files = await response.json();

    for (const file of files) {
        const fileResponse = await fetch(`/data/${folderName}/${file}`);
        const markdown = await fileResponse.text();
        const converter = new showdown.Converter();
        const html = converter.makeHtml(markdown);

        const fileDiv = document.createElement('div');
        fileDiv.innerHTML = html;
        contentDiv.appendChild(fileDiv);
    }
}