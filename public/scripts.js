document.addEventListener('DOMContentLoaded', function() {
    let isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userType = localStorage.getItem('userType');
    const loginButton = document.getElementById('login-button');
    const submitTashihButton = document.getElementById('submit-tashih');
    const submitRumusanButton = document.getElementById('submit-rumusan');
    const submitSanggahanButton = document.getElementById('submit-sanggahan');
    const submitIzinSanggahanButton = document.getElementById('submit-izin-sanggahan');
    const submitJawabanButton = document.getElementById('submit-jawaban');
    const submitPandanganAwalButton = document.getElementById('submit-pandangan-awal');
    const submitPaparanButton = document.getElementById('submit-paparan');

    if (loginButton) {
        loginButton.addEventListener('click', async function() {
            const username = prompt("Enter username:");
            const password = prompt("Enter password:");

            try {
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
                    localStorage.setItem('userName', username);
                    isLoggedIn = true; 
                    showMenuBasedOnUser(userType);
                } else {
                    alert("Invalid username or password");
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('Failed to login. Please try again.');
            }
        });
    } 

    function showMenuBasedOnUser(userType) {
        const menu = document.getElementById('menu');
        menu.innerHTML = '<a href="index.html" class="pure-button"><i class="fas fa-home"></i> Beranda</a>'; // Always show Beranda

        const buttons = [
            { text: 'Paparan', showFor: ['Admin'], page: 'paparan.html' },
            { text: 'Pandangan Awal', showFor: ['Diskusan'], page: 'pandangan-awal.html' },
            { text: 'Sanggahan', showFor: ['Diskusan'], page: 'sanggahan.html' },
            { text: 'Izin Sanggahan', showFor: ['Diskusan'], page: 'izin-sanggahan.html' },
            { text: 'Jawaban', showFor: ['Diskusan'], page: 'jawaban.html' },
            { text: 'Rumusan', showFor: ['Perumus'], page: 'rumusan.html' },
            { text: 'Tashih', showFor: ['Mushahih'], page: 'tashih.html' }
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
                localStorage.removeItem('userName');
                isLoggedIn = false; // Reset the flag
                alert('Logged out successfully!');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            });
        } else {
            button.id = 'login-button';
            button.textContent = 'Login';
        }
        menu.appendChild(button);
    }

    const userName = localStorage.getItem('userName');
    if (isLoggedIn && userType) {
        showMenuBasedOnUser(userType);
        if (window.location.pathname.includes('tashih.html')) {
            loadRumusanContent();
        } else if (window.location.pathname.includes('pandangan-awal.html')) {
            loadPaparanContent();
        } else if (window.location.pathname.includes("/sanggahan.html")) {
            if (userName == 'diskusan1') {
                loadPandanganAwalDiskusan2Content();
            } else if (userName == 'diskusan2') {
                loadPandanganAwalDiskusan1Content();
            }
        } else if (window.location.pathname.includes("izin-sanggahan.html")) {
            if (userName == 'diskusan1') {
                loadSanggahanDiskusan2Content();
            } else if (userName == 'diskusan2') {
                loadSanggahanDiskusan1Content();
            }
        }  else if (window.location.pathname.includes('jawaban.html')) {
            if (userName == 'diskusan1') {
                loadSanggahanDiskusan2Content();
            } else if (userName == 'diskusan2') {
                loadSanggahanDiskusan1Content();
            }
        }
    }

    function loadPaparanContent() {
        fetch('/data/paparan/paparan.md')
            .then(response => response.text())
            .then(markdown => {
                const converter = new showdown.Converter();
                const html = converter.makeHtml(markdown);
                document.getElementById('left-content-files').innerHTML = html;
            })
            .catch(error => console.error('Error loading Paparan content:', error));
    }

    function loadPandanganAwalDiskusan1Content() {
        fetch('/data/pandangan-awal/pandangan-awal-diskusan1.md')
            .then(response => response.text())
            .then(markdown => {
                const converter = new showdown.Converter();
                const html = converter.makeHtml(markdown);
                document.getElementById('left-content-files').innerHTML = html;
            })
            .catch(error => console.error('Error loading Pandangan Awal Diskusan 1 content:', error));
    }

    function loadPandanganAwalDiskusan2Content() {
        fetch('/data/pandangan-awal/pandangan-awal-diskusan2.md')
            .then(response => response.text())
            .then(markdown => {
                const converter = new showdown.Converter();
                const html = converter.makeHtml(markdown);
                document.getElementById('left-content-files').innerHTML = html;
            })
            .catch(error => console.error('Error loading Pandangan Awal Diskusan 2 content:', error));
    }

    function loadSanggahanDiskusan1Content() {
        fetch('/data/sanggahan/sanggahan-diskusan1.md')
            .then(response => response.text())
            .then(markdown => {
                const converter = new showdown.Converter();
                const html = converter.makeHtml(markdown);
                document.getElementById('left-content-files').innerHTML = html;
            })
            .catch(error => console.error('Error loading Sanggahan Diskusan 1 content:', error));
    }

    function loadSanggahanDiskusan2Content() {
        fetch('/data/sanggahan/sanggahan-diskusan2.md')
            .then(response => response.text())
            .then(markdown => {
                const converter = new showdown.Converter();
                const html = converter.makeHtml(markdown);
                document.getElementById('left-content-files').innerHTML = html;
            })
            .catch(error => console.error('Error loading Sanggahan Diskusan 2 content:', error));
    }

    function loadIzinSanggahanDiskusan1Content() {
        fetch('/data/izin-sanggahan/izin-sanggahan-diskusan1.md')
            .then(response => response.text())
            .then(markdown => {
                const converter = new showdown.Converter();
                const html = converter.makeHtml(markdown);
                document.getElementById('left-content-files').innerHTML = html;
            })
            .catch(error => console.error('Error loading Izin Sanggahan Diskusan 1 content:', error));
    }

    function loadIzinSanggahanDiskusan2Content() {
        fetch('/data/izin-sanggahan/izin-sanggahan-diskusan2.md')
            .then(response => response.text())
            .then(markdown => {
                const converter = new showdown.Converter();
                const html = converter.makeHtml(markdown);
                document.getElementById('left-content-files').innerHTML = html;
            })
            .catch(error => console.error('Error loading Izin Sanggahan Diskusan 2 content:', error));
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

    if (submitTashihButton) {
        submitTashihButton.addEventListener('click', async function() {
            const tashihEditor = document.getElementById('tashih-editor');
            const mushahihEditor = document.getElementById('mushahih-editor');

            if (!tashihEditor || !mushahihEditor) {
                console.error('Editor elements not found');
                return;
            }

            const tashihContent = tashihEditor.innerHTML;
            const mushahihContent = mushahihEditor.innerHTML;

            const markdownContent = `Tashih\n---\nMushahih: ${mushahihContent}\n\nPenjelasan:\n${tashihContent}`;

            try {
                console.log('Sending request to /save-tashih with content:', markdownContent);
                const response = await fetch('/save-tashih', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ content: markdownContent })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Response from server:', data);
                alert('Tashih saved successfully!');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000);
            } catch (error) {
                console.error('Error saving Tashih:', error);
                alert('Failed to save Tashih. Please try again.');
            }
        });
    } 

    if (submitRumusanButton) {
        submitRumusanButton.addEventListener('click', async function() {
            const rumusanEditor = document.getElementById('rumusan-editor');
            const perumusEditor = document.getElementById('perumus-editor');

            if (!rumusanEditor || !perumusEditor) {
                console.error('Editor elements not found');
                return;
            }

            const rumusanContent = rumusanEditor.innerHTML;
            const perumusContent = perumusEditor.innerHTML;

            const markdownContent = `Rumusan\n---\nPerumus: ${perumusContent}\n\nPenjelasan:\n${rumusanContent}`;

            try {
                console.log('Sending request to /save-rumusan with content:', markdownContent);
                const response = await fetch('/save-rumusan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ content: markdownContent })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Response from server:', data);
                alert('Rumusan saved successfully!');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000);
            } catch (error) {
                console.error('Error saving Rumusan:', error);
                alert('Failed to save Rumusan. Please try again.');
            }
        });
    } 

    if (submitJawabanButton) {
        submitJawabanButton.addEventListener('click', async function() {
            const jawabanEditor = document.getElementById('jawaban-editor');
            const diskusanEditor = document.getElementById('diskusan-editor');

            if (!jawabanEditor || !diskusanEditor) {
                console.error('Editor elements not found');
                return;
            }

            const jawabanContent = jawabanEditor.innerHTML;
            const diskusanContent = diskusanEditor.innerHTML;
            
            const userName = localStorage.getItem('userName');
            const markdownContent = `Jawaban ${userName}\n---\nDiskusan: ${diskusanContent}\n\nPenjelasan:\n${jawabanContent}`;
            
            try {
                console.log('Sending request to /save-jawaban with content:', markdownContent);
                const response = await fetch('/save-jawaban', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ content: markdownContent, username: userName })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Response from server:', data);
                alert('Jawaban saved successfully!');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } catch (error) {
                console.error('Error saving Jawaban:', error);
                alert('Failed to save Jawaban. Please try again.');
            }
        });
    } 

    if (submitIzinSanggahanButton) {
        submitIzinSanggahanButton.addEventListener('click', async function() {
            const izinSanggahanEditor = document.getElementById('izin-sanggahan-editor');
            const diskusanEditor = document.getElementById('diskusan-editor');

            if (!izinSanggahanEditor || !diskusanEditor) {
                console.error('Editor elements not found');
                return;
            }

            const izinSanggahanContent = izinSanggahanEditor.innerHTML;
            const diskusanContent = diskusanEditor.innerHTML;
            
            const userName = localStorage.getItem('userName');
            const markdownContent = `Izin Sanggahan ${userName}\n---\nDiskusan: ${diskusanContent}\n\nPenjelasan:\n${izinSanggahanContent}`;
            
            try {
                console.log('Sending request to /save-izin-sanggahan with content:', markdownContent);
                const response = await fetch('/save-izin-sanggahan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ content: markdownContent, username: userName })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Response from server:', data);
                alert('Izin Sanggahan saved successfully!');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } catch (error) {
                console.error('Error saving Izin Sanggahan:', error);
                alert('Failed to save Izin Sanggahan. Please try again.');
            }
        });
    } 

    if (submitSanggahanButton) {
        submitSanggahanButton.addEventListener('click', async function() {
            const sanggahanEditor = document.getElementById('sanggahan-editor');
            const diskusanEditor = document.getElementById('diskusan-editor');
    
            if (!sanggahanEditor || !diskusanEditor) {
                console.error('Editor elements not found');
                return;
            }
    
            const sanggahanContent = sanggahanEditor.innerHTML;
            const diskusanContent = diskusanEditor.innerHTML;
    
            const userName = localStorage.getItem('userName');
            const markdownContent = `Sanggahan ${userName}\n---\nDiskusan: ${diskusanContent}\n\nPenjelasan:\n${sanggahanContent}`;
    
            try {
                console.log('Sending request to /save-sanggahan with content:', markdownContent);
                const response = await fetch('/save-sanggahan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ content: markdownContent, username: userName })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Response from server:', data);
                alert('Sanggahan saved successfully!');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } catch (error) {
                console.error('Error saving Sanggahan:', error);
                alert('Failed to save Sanggahan. Please try again.');
            }
        });
    }
    

    if (submitPandanganAwalButton) {
        submitPandanganAwalButton.addEventListener('click', async function() {
            const pandanganAwalEditor = document.getElementById('pandangan-awal-editor');
            const diskusanEditor = document.getElementById('diskusan-editor');

            if (!pandanganAwalEditor || !diskusanEditor) {
                console.error('Editor elements not found');
                return;
            }

            const pandanganAwalContent = pandanganAwalEditor.innerHTML;
            const diskusanContent = diskusanEditor.innerHTML;
            
            const userName = localStorage.getItem('userName');
            const markdownContent = `Pandangan Awal ${userName}\n---\nDiskusan: ${diskusanContent}\n\nPenjelasan:\n${pandanganAwalContent}`;
            
            try {
                console.log('Sending request to /save-pandangan-awal with content:', markdownContent);
                const response = await fetch('/save-pandangan-awal', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ content: markdownContent, username: userName })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Response from server:', data);
                alert('Pandangan Awal saved successfully!');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 1000);
            } catch (error) {
                console.error('Error saving Pandangan Awal:', error);
                alert('Failed to save Pandangan Awal. Please try again.');
            }
        });
    } 

    if (submitPaparanButton) {
        submitPaparanButton.addEventListener('click', async function() {
            const paparanEditor = document.getElementById('paparan-editor');
            const narsumEditor = document.getElementById('narsum-editor');

            if (!paparanEditor || !narsumEditor) {
                console.error('Editor elements not found');
                return;
            }

            const paparanContent = paparanEditor.innerHTML;
            const narsumContent = narsumEditor.innerHTML;

            const markdownContent = `Paparan\n---\nNarasumber: ${narsumContent}\n\nPenjelasan:\n${paparanContent}`;

            try {
                console.log('Sending request to /save-paparan with content:', markdownContent);
                const response = await fetch('/save-paparan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ content: markdownContent })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                console.log('Response from server:', data);
                alert('Paparan saved successfully!');
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 3000);
            } catch (error) {
                console.error('Error saving Paparan:', error);
                alert('Failed to save Paparan. Please try again.');
            }
        });
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

        try {
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
        } catch (error) {
            console.error('Error loading markdown files:', error);
        }
    }
});