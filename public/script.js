const baseUrl = 'https://zeeland-stations.onrender.com' // of http://localhost:3000

const stations = {
    'MDB': { icon: 'src/img/Coat_of_arms_of_Middelburg.svg', size: [50, 55], stationImage: 'src/img/StationMiddelburg.jpg' },
    'VS': { icon: 'src/img/Vlissingen_wapen.svg', size: [40, 55], stationImage: 'src/img/Overzicht_van_de_voorgevel_met_terras_-_Vlissingen_-_20423258_-_RCE.jpg' },
    'VSS': { icon: 'src/img/Oost_Souburg_wapen.svg', size: [40, 45], stationImage: 'src/img/1280px-Station_Vlissingen_Souburg.jpg' },
    'GS': { icon: 'src/img/Coat_of_arms_of_Goes.svg', size: [40, 65], stationImage: 'src/img/1280px-NS-station_Goes.jpg' },
    'BZL': { icon: 'src/img/Coat_of_arms_of_Kapelle_(Netherlands).svg', size: [40, 60], stationImage: 'src/img/Kapelle_Biezelinge.JPG' },
    'KBD': { icon: 'src/img/Krabbendijke_wapen.svg', size: [40, 50], stationImage: 'src/img/Station_Krabbendijke.jpg' },
    'KRG': { icon: 'src/img/Kruiningen_wapen.svg', size: [40, 50], stationImage: 'src/img/Station_Kruiningen-Yerseke.jpg' },
    'RB': { icon: 'src/img/Rilland_Bath_wapen.svg', size: [40, 65], stationImage: 'src/img/Rilland-Bath1.jpg' },
    'ARN': { icon: 'src/img/Arnemuiden_wapen.svg', size: [40, 65], stationImage: 'src/img/ErremuStationsgebouw.jpg' }
};

fetch(`${baseUrl}/stationsZeeland`, { signal: AbortSignal.timeout(5000) })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const map = L.map('map').setView([51.5, 3.833333], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors, Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France'
        }).addTo(map);

        data.map(s => {
            const { lat, lng } = s.coordinates || {};
            if (!lat || !lng) {
                console.warn(`Invalid coordinates for station: ${s.station}`);
                return;
            }

            const options = stations[s.station];
            if (!options) {
                console.warn(`Station data not found for station: ${s.station}`);
                return;
            }

            const { icon, stationImage, size } = options;
            const site = s.site;

            const stationIcon = L.icon({
                iconUrl: icon,
                iconSize: size
            });

            const marker = L.marker([lat, lng], { icon: stationIcon }).addTo(map);
            marker.bindPopup(`
                <h3>${s.name}</h3>
                <p>Сoördinaten: ${lat}, ${lng}</p>
                <p>Site: <a href=${site} target="_blank">${site}</a></p>
                <img src=${stationImage} alt="" width="300" height="200" style="border-radius: 8px;"> 
            `);
        });
    })
    .catch(err => {
        console.error('Error fetching server info:', err);
    });

fetch(`${baseUrl}/nsApiStatus`, { signal: AbortSignal.timeout(5000) })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        updateStatus(data.status, data.status ? 'API werkt' : 'API werkt niet');
    })
    .catch(err => {
        console.error('Error fetching server info:', err);
        updateStatus(false, 'Error connecting to the server!');
    });

function updateStatus(isWorking, message) {
    const statusElement = document.getElementById('api-status');
    const pulseRingElement = document.getElementById('ring');
    const color = isWorking ? '#9FE2BF' : '#e74c3c';

    statusElement.textContent = message;
    statusElement.style.color = color;
    pulseRingElement.style.borderColor = color;
    pulseRingElement.style.backgroundColor = color;
}
