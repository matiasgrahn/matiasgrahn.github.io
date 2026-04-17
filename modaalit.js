
/* ==========================================
   GLOBAAALIT MUUTTUJAT & ELEMENTIT
   ========================================== */
const openBtn = document.getElementById("open-powershell");
const modal = document.getElementById("powershell-modal");
const modalBody = document.getElementById("modal-body");
const closeModalBtn = document.querySelector(".close-modal");

const openThesisBtn = document.getElementById("open-thesis");
const thesisModal = document.getElementById("thesis-modal");
const closeThesisBtn = document.querySelector(".close-thesis-modal");
const thesisModalBody = document.getElementById("thesis-modal-body");

const videoBtn = document.getElementById('play-video-btn');
const videoModal = document.getElementById('video-container');
const closeBtn = document.querySelector('.close-video');
const videoElement = document.getElementById('esittelyvideo');
/* ==========================================
   FUNKTIO POWERSHELL.HTML MODAALI
   ========================================== */
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

/* ==========================================
   FUNKTIO THESIS_CONTENT.HTML MODAALI
   ========================================== */

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
/* ==========================================
   FUNKTIO ESITTELYVIDEO MODAALI
   ========================================== */
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
//FUNKTIO VIDEOON ETTEI SE OLE TÄYSILLÄ AUTOMAATTISESTI KUN KLIKKAA AUKI
window.addEventListener('DOMContentLoaded', (event) => {
    const video = document.querySelector('video');
    if (video) {
        video.volume = 0.2; // Asettaa oletusäänenvoimakkuuden 20 prosenttiin
    }
});