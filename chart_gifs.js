/* ==========================================
   MODBUS KAAVIOT JA MOODALIT (GIFS)
   ========================================== */
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById("chartModal");
    const span = document.querySelector(".close-btn");
    const ctx = document.getElementById('modbusChart').getContext('2d');
    
    // Uudet elementit GIF-toimintoa varten
    const chartWrapper = document.getElementById('chartContainer'); // Varmista että tämä ID on HTML:ssä graafin ympärillä
    const videoWrapper = document.getElementById('videoContainer'); // Varmista että tämä ID on HTML:ssä GIFin ympärillä
    const demoGif = document.getElementById('demoGif');
    /* const modbusdata_demoGif = document.getElementById('modbusdata_demoGif');
    const chatbot_demoGif = document.getElementById('chatbot_demoGif'); */
    const modalTitle = document.querySelector("#chartModal h2");

    let updateInterval;
    let myChart;
    

    // Alustetaan graafi kerran (pysyy muistissa)
    
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                { label: 'Lämpötila (°C)', data: [], borderColor: '#ff5722', tension: 0.4 },
                { label: 'Virtaus (l/min)', data: [], borderColor: '#2196f3', tension: 0.4 },
                { label: 'Pumppu (0-1)', data: [], borderColor: '#ffd000', tension: 0.4 }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
    async function updateChart() {
        try {
            const response = await fetch('http://localhost:3000/api/modbus');
            const data = await response.json();
            myChart.data.labels = data.map(row => new Date(row.Aikaleima).toLocaleTimeString());
            myChart.data.datasets[0].data = data.map(row => row.Lampotila);
            myChart.data.datasets[1].data = data.map(row => row.Virtaus);
            myChart.data.datasets[2].data = data.map(row => row.Pumppu);
            myChart.update('none');
        } catch (err) { console.error("Haku epäonnistui:", err); }
    }

    // YLEINEN AVAUSFUNKTIO (Tätä kutsutaan napeista)
    window.openMyModal = function(type) {
        modal.style.display = "block";
        modalTitle.style.color = "#fffefb";
        // Piilotetaan molemmat aluksi
        chartWrapper.style.display = "none";
        videoWrapper.style.display = "none";
        clearInterval(updateInterval); // Pysäytetään vanhat päivitykset

        if (type === 'modbus') {
            modalTitle.innerText = "Modbus Live-data. Only works on Live-server currently, check demo (GIF).";
            chartWrapper.style.display = "block";
            updateChart();
            updateInterval = setInterval(updateChart, 5000);
        } 
        else if (type === 'powershell') {
            modalTitle.innerText = "PowerShell-automaatio Demo";
            videoWrapper.style.display = "block";
            demoGif.src = "visuals/Animaatio.gif"; // Varmista tiedostonimi ja polku
        }
        else if (type === 'modbus-data') {
            modalTitle.innerText = "Modbus data Demo";
            videoWrapper.style.display = "block";
            demoGif.src = "visuals/modbus_animaatio.gif"; // Varmista tiedostonimi ja polku
        }
        else if (type === 'chatbot') {
            modalTitle.innerText = "Chatbot Demo";
            videoWrapper.style.display = "block";
            demoGif.src = "visuals/chatbot_animaatio.gif"; // Varmista tiedostonimi ja polku
        }
    }

    // SULKEMINEN
    const closeModal = () => {
        modal.style.display = "none";
        clearInterval(updateInterval);
        demoGif.src = ""; // Tyhjennetään GIF, ettei se jää pyörimään taustalle
    };

    span.onclick = closeModal;
    window.onclick = (event) => { if (event.target == modal) closeModal(); };
});