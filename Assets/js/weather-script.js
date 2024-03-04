const WEATHER_API_BASE_URL = 'https://api.openweathermap.org';
const WEATHER_API_KEY = 'f23ee9deb4e1a7450f3157c44ed020e1';

const cityInput = document.querySelector (".city-input");
const searchButton = document.querySelector (".search-btn");
const weatherCardsDiv = document.querySelector (".weather-cards");
const currentWeatherDiv = document.querySelector (".current-weather");

const recentLocations = [];
function loadRecentLocations() {
    
    const recentLocations = JSON.parse(localStorage.getItem('recentLocations'));

    if (recentLocations !== null) {
        document.getElementById('recent-locations').innerHTML = "";

        for (let i = 0; i < recentLocations.length; i++) {
            var newLocation = document.createElement('div');
            newLocation.classList.add('recent-locations');
            newLocation.textContent = recentLocations[i];
            newLocation.addEventListener('click', onClickRecentLocation);

            document.getElementById('recent-locations').appendChild(newLocation);
        }
    }
}
function onClickRecentLocation(event) {
    const searchLocation = event.target.textContent;
    getCityCoordinates(searchLocation);
}

function saveRecentLocation(searchLocation) {
    const recentLocations = JSON.parse(localStorage.getItem('recentLocations'))||[]
    const index = recentLocations.indexOf(searchLocation);

    if (index === -1) {
        recentLocations.push(searchLocation);

        localStorage.setItem('recentLocations', JSON.stringify(recentLocations));
        loadRecentLocations();
    }
}

const createWheatherCard = (cityName, weatherItem, index) => {
    if (index === 0) {
        return `<div class="details">
                    <h2>${cityName} (${weatherItem.dt_txt.split(" ")[0]})</h2>
                    <h4>Temperature: ${(weatherItem.main.temp - 27.15).toFixed(0)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} MPH</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </div>
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h4>${weatherItem.weather[0].description}</h4>
                </div>`;
    } else {
        return `<li class="card">
                    <h3>${weatherItem.dt_txt.split(" ")[0]}</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="weather-icon">
                    <h4>Temp: ${(weatherItem.main.temp - 27.15).toFixed(0)}°C</h4>
                    <h4>Wind: ${weatherItem.wind.speed} MPH</h4>
                    <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                </li>`;
    }
}
const getWeatherDetails = (cityName, lat, lon) => {
    var apiUrl = `${WEATHER_API_BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&exclude=minutely,hourly&appid=${WEATHER_API_KEY}`;

    fetch(apiUrl).then(res => res.json()).then(data => {
        const uniqueForcastDays = [];
        const fiveDayForecast = data.list.filter(forecast => {
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if(!uniqueForcastDays.includes(forecastDate)) {
                return uniqueForcastDays.push(forecastDate);
            }
        });
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";
        fiveDayForecast.forEach((weatherItem, index) => {
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", createWheatherCard(cityName, weatherItem, index));
            } else {
                weatherCardsDiv.insertAdjacentHTML("beforeend", createWheatherCard(cityName, weatherItem, index));
            }
        });
    }).catch (() => {
        alert("An error has occurred whilst getting the weather forecast!");
    });
}

function onClickSearch (event) {
    const cityName = cityInput.value.trim();
    if (!cityName) return;
    getCityCoordinates(cityName);
}

const getCityCoordinates = (cityName) => {
    
    var geoapiUrl = `${WEATHER_API_BASE_URL}/geo/1.0/direct?q=${cityName}&limit=5&appid=${WEATHER_API_KEY}`;;
    fetch (geoapiUrl).then(res => res.json()).then(data => {
        if(!data.length) return alert(`No coordinates found for ${cityName}`);
        const {name, lat, lon} = data[0];
        getWeatherDetails(name, lat, lon);
        saveRecentLocation(cityName);
    }).catch (() => {
        alert("An error has occurred whilst trying to fetch your coordinates!");
    });

}

async function lookupCurrency () {
    const cityNameEl = document.querySelector (".city-input");
    var cityName = cityNameEl.value.trim();
    if (!cityName) {
        alert("Please enter a location");
        return;
    }

    try {
        const response = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(cityName)}&key=34c8054dad65420e89940d394011c178`);
        console.log(cityName);
        const data = await response.json();

        console.log(data);
        const { lat, lon } = data.results[0].geometry;
        const countryCode = data.results[0].components.country_code.toUpperCase();

        console.log(lat, lon, countryCode);
        let currencyCode = '';
        fetch('currencies.json')
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                
                console.log(data.countries);
                
                // lookup the currency code
                data.countries.country.forEach(country => {
                    
                    if (country.countryCode === countryCode) {
                        currencyCode = country.currencyCode;
                        document.getElementById('result').innerText = `Currency Code for ${cityName}: ${currencyCode}`;
                        return;
                    }
                });
            })
            .catch(function (err) {
                console.log('error: ' + err);
            });
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result').innerText = 'Error fetching currency code';
    }
}

loadRecentLocations();

searchButton.addEventListener ("click", onClickSearch);
searchButton.addEventListener ("click", lookupCurrency);

