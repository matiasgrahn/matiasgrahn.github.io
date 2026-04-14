const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors()); // Sallii frontentin ottaa yhteyden tähän backendiin

// SQL Server -asetukset
const config = {
    user: 'admin', // Tai se tunnus millä kirjaudut
    password: Process.env.DB_PASSWORD, 
    server: 'localhost', 
    database: 'InventoryDB',
    options: {
        encrypt: false, // Käytä true jos olet Azure-pilvessä
        trustServerCertificate: true // Tärkeä paikallisessa kehityksessä
    }
};

// Luodaan API-piste, josta haetaan viimeisin status
app.get('/api/status', async (req, res) => {
    try {
        let pool = await sql.connect(config);
        let result = await pool.request()
            .query('SELECT TOP 1 * FROM SystemDiagnostics ORDER BY ID DESC');
        
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Backend pyörii osoitteessa http://localhost:${PORT}`);
});