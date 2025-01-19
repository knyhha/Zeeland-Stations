require('dotenv').config();

const cors = require('cors');
const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const NSAPI = require('ns-api');

const app = express();
const PORT = 3000;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.'
});

const corsOptions = {
    origin: "*",
    methods: "GET",
    optionsSuccessStatus: 200
}

app.use(limiter);
app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, 'public')));

const ns = new NSAPI({
    key: process.env.API_TOKEN_PRIMARY_KEY,
});

const uicCodes = ['MDB', 'GS', 'VS', 'VSS', 'BZL', 'KBD', 'KRG', 'RB', 'ARN']

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/stationsZeeland', async (req, res) => {
    const stationsData = await Promise.all(
        uicCodes.map(async (code) => {
            try {
                const place = await ns.placesGet({ type: 'stationV2', id: code });
                const stationName = place?.name || 'N/A';
                const lat = place?.lat || 0;
                const lng = place?.lng || 0;
                const url = place?.sites?.[0]?.url || 'N/A';

                return { station: code, name: stationName, coordinates: { lat, lng }, site: url };
            } catch (err) {
                console.error(`Error fetching data for station ${code}:`, err);
                return { station: code, error: 'Failed to fetch data' };
            }
        })
    );

    res.json(stationsData);
});

app.get('/nsApiStatus', async (req, res) => {
    try {
        const response = await fetch('https://apiportal.ns.nl/');

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        res.status(200).json({ status: 'API is working', statusCode: response.status });
    } catch (err) {
        console.error(`Error checking API status:`, err);
        res.status(500).json({ status: 'API is not working', error: err.message });
    }
});

app.listen(PORT, function (err) {
    if (err) console.log("Error in server setup")
    console.log("Server listening on Port", PORT);
})