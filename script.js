const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const body = document.body;
const videoBtn = document.getElementById('play-video-btn');
const videoModal = document.getElementById('video-container');
const closeBtn = document.querySelector('.close-video');
const videoElement = document.getElementById('esittelyvideo');


// 1. Tarkistetaan onko käyttäjä valinnut tumman teeman aiemmin
const currentTheme = localStorage.getItem('theme');
if (currentTheme) {
    body.classList.add(currentTheme);
    // Jos aiemmin tallennettu teema on dark, laitetaan kytkin "päälle"
    if (currentTheme === 'dark-theme') {
        themeToggle.checked = true;
    }
}

// Kuunnellaan kytkimen muuttumista (klikkaus)
themeToggle.addEventListener('change', (e) => {
    // Jos kytkin on kytketty päälle
    if (e.target.checked) {
        body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark-theme'); // Tallennetaan valinta
    } else {
        body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light-theme'); // Poistetaan dark mode tallennuksesta
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

// 4. Korjaus "takaisin-nappiin" ja swaippaamiseen
window.addEventListener('pageshow', (event) => {
    // Jos event.persisted on true, sivu ladattiin selaimen välimuistista (back-button)
    if (event.persisted) {
        // Poistetaan mahdolliset fade-out luokat ja varmistetaan näkyvyys
        document.body.classList.remove('fade-out');
        document.body.classList.add('fade-in');
        
        // Jos haluat pakottaa täyden uudelleenlatauksen:
        // window.location.reload(); 
    }
});

window.addEventListener('DOMContentLoaded', (event) => {
    const video = document.querySelector('video');
    if (video) {
        video.volume = 0.2; // Asettaa oletusäänenvoimakkuuden 20 prosenttiin
    }
});

const navLinks = document.querySelectorAll('.nav-links a, .scroll-down');

navLinks.forEach(link => {
    link.addEventListener('click', function (e) {
        // Estetään perinteinen välitön hyppy
        e.preventDefault(); 

        // Haetaan kohteen ID (esim. #projektit)
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
            // Lasketaan navigaatiopalkin korkeus, jotta skrollaus ei peitä otsikkoa
            const navHeight = document.querySelector('.top-nav').offsetHeight;
            const targetPosition = targetElement.offsetTop - navHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// VIDEO BOXIN AVAUS 
videoBtn.addEventListener('click', (e) => {
    e.preventDefault();
    videoModal.style.display = 'flex';
    videoElement.play(); // Video alkaa heti kun modal aukeaa
});

closeBtn.addEventListener('click', () => {
    videoModal.style.display = 'none';
    videoElement.pause(); // Video pysähtyy kun se suljetaan
});

// Sulje video klikkaamalla videon ulkopuolelle
window.addEventListener('click', (e) => {
    if (e.target == videoModal) {
        videoModal.style.display = 'none';
        videoElement.pause();
    }
});

// Piilottaa Navigointi palkin kun skrollaaa
let lastScrollY = window.scrollY;
const nav = document.querySelector('.top-nav');

window.addEventListener('scroll', () => {
    // Tarkistetaan onko kyseessä mobiili (leveys alle 600px)
    if (window.innerWidth <= 800) {
        if (window.scrollY > lastScrollY && window.scrollY > 50) {
            // Skrollataan alas -> piilota
            nav.classList.add('nav-hidden');
        } else {
            // Skrollataan ylös -> näytä
            nav.classList.remove('nav-hidden');
        }
    } else {
        // Varmistetaan, että työpöydällä palkki on aina näkyvissä
        nav.classList.remove('nav-hidden');
    }
    lastScrollY = window.scrollY;
});

// Paremmin toimiva sähköposti formi
var form = document.getElementById("my-form");

async function handleSubmit(event) {
    event.preventDefault();
    var button = event.target.querySelector(".btn");
    var data = new FormData(event.target);

    button.disabled = true;
    button.innerHTML = "Lähetetään...";

    fetch("https://formspree.io/f/xwvaepje", { // <-- VAIHDA TÄHÄN SUN KOODI
        method: "POST",
        body: data,
        headers: {
            'Accept': 'application/json'
        }
    }).then(response => {
        if (response.ok) {
            button.innerHTML = "Viesti lähetetty!";
            button.style.backgroundColor = "#28a745"; // Muuttuu vihreäksi
            form.reset();
        } else {
            button.innerHTML = "Hups! Yritä uudelleen";
            button.disabled = false;
        }
    }).catch(error => {
        button.innerHTML = "Verkkovirhe";
        button.disabled = false;
    });
}
form.addEventListener("submit", handleSubmit);


// Etsi nappi, joka avaa koodin (varmista että napilla on id="open-powershell")
const openBtn = document.getElementById("open-powershell");
const modal = document.getElementById("powershell-modal");
const modalBody = document.getElementById("modal-body");
const closeModalBtn = document.querySelector(".close-modal"); 

openBtn.addEventListener("click", function(e) {
    e.preventDefault();
    
    // Ladataan powershell.html sisältö
    fetch('powershell.html')
        .then(response => response.text())
        .then(data => {
            modalBody.innerHTML = data;
            modal.style.display = "block";
            document.body.style.overflow = "hidden"; // Estää pääsivun rullauksen
        });
});

// Sulje klikkaamalla ruksia
closeModalBtn.onclick = function() {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
}

// Sulje klikkaamalla ikkunan ulkopuolelle
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    }
}

const openThesisBtn = document.getElementById("open-thesis");
const thesisModal = document.getElementById("thesis-modal");
const closeThesisBtn = document.querySelector(".close-thesis-modal");
const thesisModalBody = document.getElementById("thesis-modal-body");

openThesisBtn.addEventListener("click", function(e) {
    e.preventDefault();
    fetch('thesis_content.html') // Luodaan tämä tiedosto seuraavaksi
        .then(response => response.text())
        .then(data => {
            thesisModalBody.innerHTML = data;
            thesisModal.style.display = "block";
            document.body.style.overflow = "hidden";
        });
});

closeThesisBtn.onclick = function() {
    thesisModal.style.display = "none";
    document.body.style.overflow = "auto";
}

