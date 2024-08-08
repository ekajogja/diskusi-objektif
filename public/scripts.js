let isLoggedIn = false; // Flag to indicate if the user is logged in

document.addEventListener('DOMContentLoaded', function() {
    isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userType = localStorage.getItem('userType');
    if (isLoggedIn && userType) {
        showMenuBasedOnUser(userType);
    }
});

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
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userType', userType);
        showMenuBasedOnUser(userType);
    } else {
        alert("Invalid username or password");
    }
});

function showMenuBasedOnUser(userType) {
    const menu = document.getElementById('menu');
    menu.innerHTML = '<a href="index.html" class="pure-button"><i class="fas fa-home"></i> Beranda</a>'; // Always show Beranda

    const buttons = [
        { text: 'Pandangan Awal', showFor: ['Admin', 'Diskusan'], page: 'pandangan-awal.html' },
        { text: 'Sanggahan', showFor: ['Admin', 'Diskusan'], page: 'sanggahan.html' },
        { text: 'Izin Sanggahan', showFor: ['Admin', 'Diskusan'], page: 'izin-sanggahan.html' },
        { text: 'Jawaban', showFor: ['Admin', 'Diskusan'], page: 'jawaban.html' },
        { text: 'Rumusan', showFor: ['Admin', 'Perumus'], page: 'rumusan.html' },
        { text: 'Tashih', showFor: ['Admin', 'Mushahih'], page: 'tashih.html' },
        { text: 'Dasbor Admin', showFor: ['Admin'], page: 'dasbor-admin.html' }
    ];

    buttons.forEach(button => {
        if (button.showFor.includes(userType)) {
            const btn = document.createElement('a');
            btn.href = button.page;
            btn.className = 'pure-button';
            btn.innerHTML = `<i class="fas fa-pen"></i> ${button.text}`; // Add pen icon
            btn.addEventListener('click', function(event) {
                event.preventDefault();
                window.location.href = button.page;
            });
            menu.appendChild(btn);
        }
    });

    // Remove existing login/logout button if any
    const existingLoginButton = document.getElementById('login-button');
    if (existingLoginButton) {
        menu.removeChild(existingLoginButton);
    }

    const existingLogoutButton = document.getElementById('logout-button');
    if (existingLogoutButton) {
        menu.removeChild(existingLogoutButton);
    }

    // Add the appropriate button based on login status
    const button = document.createElement('a');
    button.href = '#';
    button.className = 'pure-button';
    if (isLoggedIn) {
        button.id = 'logout-button';
        button.textContent = 'Logout';
        button.addEventListener('click', function() {
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userType');
            isLoggedIn = false; // Reset the flag
            window.location.reload(); // Refresh the page
        });
    } else {
        button.id = 'login-button';
        button.textContent = 'Login';
    }
    menu.appendChild(button);
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