require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
const request = require('superagent');

app.use(cors());


const {
    GEOCODE_API_KEY,
    MOVIE_KEY,
    WEATHER_KEY,
    TRAILS_KEY
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

async function getWeather(lat, lon) {
    const response = await request.get(`https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${WEATHER_KEY}`);
    const data = response.body.data;
    const forecastArray = data.map((weatherItem) => {
        return {
            forecast: weatherItem.weather.description,
            time: new Date(weatherItem.ts * 1000),
        };
    });
    return forecastArray;
}

async function getTrails(lat, lon) {
    const response = await request.get(`https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&maxDistance=200&key=${TRAILS_KEY}`);

    const hikes = response.body.trails;

    const allHikes = hikes.map(hike => {

        return {
            trail_url: hike.url,
            name: hike.name,
            location: hike.location,
            length: hike.length,
            condition_date: new Date(hike.conditionDate).toDateString(),
            condition_time: new Date(hike.conditionDate).toTimeString(),
            conditions: hike.conditionStatus,
            stars: hike.stars,
            star_votes: hike.starVotes,
            summary: hike.summary

        };
    });
    return allHikes;
}

app.get('/trails', async(req, res) => {
    try {
        const userLat = req.query.latitude;
        const userLong = req.query.longitude;
    
        const mungedData = await getTrails(userLat, userLong);
        res.json(mungedData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/location', async(req, res) => {
    try {
        const userInput = req.query.search;
    
        const mungedData = await getLatLong(userInput);
        res.json(mungedData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/weather', async(req, res) => {
    try {
        const userLat = req.query.latitude;
        const userLong = req.query.longitude;
    
        const mungedData = await getWeather(userLat, userLong);
        res.json(mungedData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

async function mungeMovies(cityName) {
    const data = await request.get(`http://api.themoviedb.org/3/search/movie?api_key=${MOVIE_KEY}&query=${cityName}`);
    const movies = data.body.results;

    const mungedMovies = movies.map((movie) => {
        return {
            title: movie.original_title,
            release: movie.release_date
        };
    });
    return mungedMovies;
}

app.get('/movies', async(req, res) => {
    try {
        const userInput = req.query.search;

        const movies = await mungeMovies(userInput);

        res.json(movies);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});