const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// --- KONFIGURAATIOT ---
const dbConfig = {
    user: 'admin',
    password: process.env.DB_PASSWORD,
    server: 'localhost',
    database: 'InventoryDB',
    options: { encrypt: false, trustServerCertificate: true }
};

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",

    systemInstruction: `
        Olet Matias Grahn portfolio-assistentti. Matias opiskelee VAMKissa tietotekniikkaa.
        
        KESKEISET TIEDOT MATIAKSESTA:
        - Osaaminen: PowerShell-automatisointi, Windows Server -hallinta ja SQL-tietokannat.
        - Erikoistuminen: Teollisuuden IT-ratkaisut ja Purdue-malli.
        - Opinnäytetyö aihe: Sulauttettujen järjestelmien kyberturvallisuus, Tapaustutkimus tiedonsiirto protokollista (Modbus ja CAN-bus).
        
        PURDUE-MALLI (Matiaksen muistiinpanot):
        - Taso 0-2: Kenttälaitteet, sensorit ja PLC-ohjaus.
        - Taso 3: Teollisuuden it-toiminnot ja valvonta (tällä tasolla Matiaksen InventoryDB sijaitsee).
        - Taso 4-5: Yritysverkko ja toiminnanohjaus.
        
        OHJEET VASTAUKSIIN:
        - Vastaa aina suomeksi.
        - Ole kohtelias ja ammattimainen.
        - Jos joku kysyy Matiaksesta tai hänen osaamisestaan, käytä yllä olevia tietoja.
        - Jos kysymys on koodauksesta, kerro että Matias hallitsee erityisesti skriptauksen ja tietokantojen hallinnan.
    
    `
});

const chat = model.startChat({
    history: [],
    generationConfig: {
        maxOutputTokens: 500,
    },
});

// --- RAJAPINNAT ---

// SQL-yhteys testi
app.get('/api/status', async (req, res) => {
    try {
        let pool = await sql.connect(dbConfig);
        let result = await pool.request().query('SELECT TOP 1 * FROM SystemDiagnostics ORDER BY ID DESC');
        res.json(result.recordset[0]);
    } catch (err) { res.status(500).send(err.message); }
});

app.get('/api/modbus', async (req, res) => {
    try {
        // MUUTETTU: 'config' -> 'dbConfig'
        await sql.connect(dbConfig); 
        const result = await sql.query`SELECT TOP 30 * FROM ModbusLog ORDER BY Aikaleima DESC`;
        res.json(result.recordset.reverse());
    } catch (err) {
        console.error("Virhe:", err);
        res.status(500).send("Palvelinvirhe: " + err.message);
    }
});

// Chatbot
app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        // Käytetään sendMessage-metodia generateContentin sijaan
        const result = await chat.sendMessage(message);
        const response = await result.response;
        res.json({ reply: response.text() });
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: "AI-virhe" });
    }
});

// --- KÄYNNISTYS (Vain yksi!) ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serveri pyörii: http://localhost:${PORT}`);
    console.log(`🤖 Tekoäly valmiina vastaamaan!`);
});