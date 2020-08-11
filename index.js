const express = require('express');
const app = express();
const cors = require('cors');
const { geoData } = require('./data/geo.js');
const { weatherData } = require('./data/weather.js');
const port = 3000;

app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

function getLatLong(cityName) {
    const city = geoData[0];

    return {
        formatted_query: city.display_name,
        latitude: city.lat,
        longitude: city.lon,
    };
}

function getWeather(lat, lon) {
    const data = weatherData.data;
    const forecastArray = data.map((weatherItem) => {
        return {
            forecast: weatherItem.weather.description,
            time: new Date(weatherItem.ts * 1000),
        };
    });
return forecastArray;
}

app.get('/location', (req, res) => {
    try {
        const userInput = req.query.search;
    
        const mungedData = getLatLong(userInput);
        res.json(mungedData);
    } catch (e) {
        res.json(e.message);
    }
});

app.get('/weather', (req, res) => {
    try {
        const userLat = req.query.latitude;
        const userLong = req.query.longitude;
    
        const mungedData = getWeather(userLat, userLong);
        res.json(mungedData);
    } catch (e) {
        res.json(e.message);
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});