/* ==========================================
   GLOBAAALIT MUUTTUJAT & ELEMENTIT
   ========================================== */
   // Teeman hallinta
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const body = document.body;
const currentTheme = localStorage.getItem('theme');
// Navigointi ja Skrollaus
const navLinks = document.querySelectorAll('.nav-links a, .scroll-down');
const nav = document.querySelector('.top-nav');
// Chattibotti
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');
const chatMessages = document.getElementById('chat-messages');
/* --- THEME MANAGEMENT (DARK/LIGHT MODE) --- */
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

// Vähän paremman näköistä sivun vaihtoa
window.addEventListener('DOMContentLoaded', () => {
    // Feidataan sivu sisään heti kun se ladatau
    document.body.classList.add('fade-in');

    // Etsitään kaikki linkit, jotka johtavat toiselle sivulle
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
// Korjaus "takaisin-nappiin" ja swaippaamiseen
window.addEventListener('pageshow', (event) => {
    // Jos event.persisted on true, sivu ladattiin selaimen välimuistista (back-button)
    if (event.persisted) {
        // Poistetaan mahdolliset fade-out luokat ja varmistetaan näkyvyys
        document.body.classList.remove('fade-out');
        document.body.classList.add('fade-in');
    }
});


//FUNKTIO "SMOOTH NAVIGATION"
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


// FUNKTIO NAVIGOINTIPALKIN PIILOTTAMISEEN PUHELIMELLA
let lastScrollY = window.scrollY;
window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    // Määritetään kynnysarvo (esim. 1100px tai window.innerHeight), 
    const firstPageHeight = window.innerHeight * 0.8; 
    if (window.innerWidth <= 1100) {
        if (currentScrollY > firstPageHeight) {
            // Jos ollaan ekan sivun alapuolella, pidetään navi aina piilossa
            nav.classList.add('nav-hidden');
        } else {
            // Jos ollaan vielä ekan sivun alueella, käytetään normaalia logiikkaa
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                nav.classList.add('nav-hidden');
            } else {
                nav.classList.remove('nav-hidden');
            }
        }
    } else {
        nav.classList.remove('nav-hidden');
    }
    lastScrollY = currentScrollY;
});

document.addEventListener("DOMContentLoaded", () => {
    const mainCard = document.getElementById("profile-main-card");
    const showSkillsBtn = document.querySelector(".show-skills-btn");
    const hideSkillsBtn = document.querySelector(".hide-skills-btn");

    // Kun klikataan "View Skills", näytetään takapuoli
    if (showSkillsBtn && mainCard) {
        showSkillsBtn.addEventListener("click", () => {
            mainCard.classList.add("show-skills");
        });
    }

    // Kun klikataan "Back to Profile", palataan etupuolelle
    if (hideSkillsBtn && mainCard) {
        hideSkillsBtn.addEventListener("click", () => {
            mainCard.classList.remove("show-skills");
        });
    }
});

// SÄHKÖPOSTI FUNKTIO
var form = document.getElementById("my-form");
async function handleSubmit(event) {
    event.preventDefault();
    var button = event.target.querySelector(".btn");
    var data = new FormData(event.target);
    
    button.disabled = true;
    button.innerHTML = "Lähetetään...";
    fetch("https://formspree.io/f/xwvaepje", {
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

// FUNKTIO PoweShell datan hakuun
function fetchStatus() {
    fetch('http://localhost:3000/api/status')
        .then(response => response.json())
        .then(data => {
            const statusContent = document.getElementById('live-status-content');
            let trendiTeksti = data.Trendi;
            let vari = "inherit";
            const pvmObj = new Date(data.ScanDate);
            const naytettavaAika = data.ScanDate.split('T')[1].substring(0, 5); // Ottaa vain "14:17"
            const naytettavaPvm = new Date(data.ScanDate).toLocaleDateString('fi-FI');
            const lopullinenAikaleima = `${naytettavaPvm} klo ${naytettavaAika}`;

            if (trendiTeksti === "Laskussa") {
                trendiTeksti = "⬇️ Laskussa";
                vari = "#ff4d4d"; // Punainen
            } else if (trendiTeksti === "Kasvussa") {
                trendiTeksti = "⬆️ Kasvussa";
                vari = "#28a745"; // Vihreä
            }
            statusContent.innerHTML = `
                <div style="text-align: left; font-size: 0.9em; line-height: 1.6;">
                    <p style="border-bottom: 1px solid #444; padding-bottom: 5px; margin-bottom: 10px;">
                        <strong><i class="fa-solid fa-microchip"></i> Diagnostiikka (PS1 + SQL)</strong>
                    </p> 
                    <p><strong><i class="fa-solid fa-clock"></i> Päivitetty:</strong> ${lopullinenAikaleima}</p>
                    <p><strong><i class="fa-solid fa-desktop"></i> Isäntä:</strong> ${data.ComputerName}</p>
                    <p><strong><i class="fa-solid fa-hard-drive"></i> Vapaa tila:</strong> ${data.Levytila} GB</p>
                    <p><strong><i class="fa-solid fa-chart-line"></i> Levytila:</strong> <span style="color: ${vari}; font-weight: bold;">${trendiTeksti}</span></p>
                    <p><strong><i class="fa-solid fa-shield"></i> Päivitykset:</strong> ${data.Paivitykset}</p>
                </div>
            `;
        })
        .catch(err => {
            console.error("Virhe ladattaessa JSONia:", err);
            document.getElementById('live-status-content').innerHTML = "<p>Tilaa ei saatavilla. Odota automaattista päivitystä. </p>";
        });
}
// FUNKTIO CHATTIBOTTIIN.
// 1. Ikkunan avaaminen ja sulkeminen (SÄILYTETÄÄN)
function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    chatWindow.classList.toggle('chat-hidden');
}
// 2. Viestien lähettäminen ja Backend-yhteys
async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    // Lisätään käyttäjän viesti näytölle
    appendMessage(text, 'user-message');
    chatInput.value = '';
    try {
        // Yhteys backend-palvelimeens
        const response = await fetch('http://localhost:3000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        const data = await response.json();
        // Lisätään Geminin vastaus näytölle
        appendMessage(data.reply, 'bot-message');
    } catch (error) {
        console.error('Virhe:', error);
        appendMessage('Hups! Yhteys palvelimeen katkesi.', 'bot-message');
    }
}
// Apufunktio viestien lisäämiseen dynaamisesti (DOM-manipulaatio)
function appendMessage(text, className) {
    const div = document.createElement('div');
    div.className = `message ${className}`;
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
// Tapahtumakuuntelijat (Event Listeners)
sendBtn.addEventListener('click', sendMessage);

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});