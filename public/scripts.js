document.addEventListener('DOMContentLoaded', function() {
    let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userType = localStorage.getItem('userType');
    if (isLoggedIn && userType) {
        showMenuBasedOnUser(userType);
        if (window.location.pathname.includes('tashih.html')) {
            loadRumusanContent();
        }
    }

    const loginButton = document.getElementById('login-button');
    if (loginButton) {
        loginButton.addEventListener('click', async function() {
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
    } else {
        console.error('Login button not found');
    }

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
                alert('Logged out successfully!');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000);
            });
        } else {
            button.id = 'login-button';
            button.textContent = 'Login';
        }
        menu.appendChild(button);
    }

    function loadRumusanContent() {
        fetch('/data/rumusan/rumusan.md')
            .then(response => response.text())
            .then(markdown => {
                const converter = new showdown.Converter();
                const html = converter.makeHtml(markdown);
                document.getElementById('rumusan-content').innerHTML = html;
            })
            .catch(error => console.error('Error loading Rumusan content:', error));
    }

    const submitTashihButton = document.getElementById('submit-tashih');
    if (submitTashihButton) {
        submitTashihButton.addEventListener('click', function() {
            const tashihEditor = document.getElementById('tashih-editor');
            const mushahihEditor = document.getElementById('mushahih-editor');

            const tashihContent = tashihEditor.innerHTML;
            const mushahihContent = mushahihEditor.innerHTML;

            const markdownContent = `Tashih\n---\nMushahih: ${mushahihContent}\n\nPenjelasan:\n${tashihContent}`;

            fetch('/save-tashih', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: markdownContent })
            })
            .then(response => response.json())
            .then(data => {
                alert('Tashih saved successfully!');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000);
            })
            .catch(error => {
                console.error('Error saving Tashih:', error);
                alert('Failed to save Tashih. Please try again.');
            });
        });
    } else {
        console.error('Submit Tashih button not found');
    }

    const submitRumusanButton = document.getElementById('submit-rumusan');
    if (submitRumusanButton) {
        submitRumusanButton.addEventListener('click', function() {
            const rumusanEditor = document.getElementById('rumusan-editor');
            const perumusEditor = document.getElementById('perumus-editor');

            const rumusanContent = rumusanEditor.innerHTML;
            const perumusContent = perumusEditor.innerHTML;

            const markdownContent = `Rumusan\n---\nPerumus: ${perumusContent}\n\nPenjelasan:\n${rumusanContent}`;

            fetch('/save-rumusan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: markdownContent })
            })
            .then(response => response.json())
            .then(data => {
                alert('Rumusan saved successfully!');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000);
            })
            .catch(error => {
                console.error('Error saving Rumusan:', error);
                alert('Failed to save Rumusan. Please try again.');
            });
        });
    } else {
        console.error('Submit Rumusan button not found');
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
});