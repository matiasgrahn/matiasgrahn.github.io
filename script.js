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
// 3. vähän paremman näköistä sivun vaihtoa
window.addEventListener('DOMContentLoaded', () => {
    // 1. Feidataan sivu sisään heti kun se ladatau
    document.body.classList.add('fade-in');

    // 2. Etsitään kaikki linkit, jotka johtavat toiselle sivulle
    const links = document.querySelectorAll('a');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            // Tarkistetaan, että linkki on sisäinen (ei esim. LinkedIn)
            if (link.hostname === window.location.hostname) {
                e.preventDefault(); // Estetään välitön siirtyminen
                const target = link.href;

                // Lisätään fade-out luokka
                document.body.classList.remove('fade-in');
                document.body.classList.add('fade-out');

                // Odotetaan animaation kesto (0.5s) ja vaihdetaan sitten sivua
                setTimeout(() => {
                    window.location.href = target;
                }, 500);
            }
        });
    });
});