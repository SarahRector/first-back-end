require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const { weatherData } = require('./data/weather.js');
const port = process.env.PORT || 3000;
const request = require('superagent');

app.use(cors());


const {
    GEOCODE_API_KEY,
    MOVIE_KEY
} = process.env;

async function getLatLong(cityName) {
    const response = await request.get(`https://us1.locationiq.com/v1/search.php?key=${GEOCODE_API_KEY}&q=${cityName}&format=json`);

    const city = response.body[0];

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

app.get('/location', async(req, res) => {
    try {
        const userInput = req.query.search;
    
        const mungedData = await getLatLong(userInput);
        res.json(mungedData);
    } catch (e) {
        res.status(500).json({ error: e.message });
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

/* async function mungeMovies(cityName) {
    const data = await request.get(api url with query....add api key and city name template literals);
    const movies = data.body.results;

    const mungeMovies = movies.map(movie) => {
        return{
            title: movie.origional_title,
            release: movie.release_date
        }
    }
    return mungeMovies;
}

app.get('/movies', async(req, res) => {
    try {
        const userInput = req.query.search;

        const movies = mungeMovies(city)

        res.json(mungeMovies);
    } catch (e) {
        res.json(e.message);
    }
});*/

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});