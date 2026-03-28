const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const body = document.body;

// 1. Tarkistetaan onko käyttäjä valinnut tumman teeman aiemmin
if (localStorage.getItem('theme') === 'dark') {
    body.classList.add('dark-theme');
    themeIcon.classList.replace('fa-moon', 'fa-sun');
}

// 2. Kuunnellaan napin painallusta
themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-theme');
    
    // Vaihdetaan ikoni ja tallennetaan asetus muistiin
    if (body.classList.contains('dark-theme')) {
        themeIcon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'dark');
    } else {
        themeIcon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'light');
    }
});