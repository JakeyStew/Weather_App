'use strict';

const API_KEY = '363ac66cf160ad199544cbae912c3764'; //Poor practice to have in Front-End but no backend for now.
let CITY_NAME = '';
let API_URL = ''; //api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key} <--Default API URL

//Input Elements
const searchButtonEl = document.querySelector('.btn');
const inputValueEl = document.querySelector('.input__value');
const unitToggleButton = document.querySelector('[data-unit-toggle]');
const metricRadio = document.getElementById('cel');
const impreialRadio = document.getElementById('fah');
//Data Elements
const weatherDataEl = document.querySelector('.weather__data');
const searchBarShiftEl = document.querySelector('.container');
const currentLocationEl = document.querySelector('[data-current-location]'); //Always forget the damn square brackets!
const currentMaxTempEl = document.querySelector('[data-current-temp-high]');
const currentMinTempEl = document.querySelector('[data-current-temp-low]');
const currentDateEl = document.querySelector('[data-current-date]');
const currentTimeEl = document.querySelector('[data-current-time]');
const windSpeedEl = document.querySelector('[data-wind-speed]');
const windDirTextEl = document.querySelector('[data-wind-direction-text]');
const windDirArrowEl = document.querySelector('[data-wind-direction-arrow]');

// Global Accessor
let weatherDataObject = {};

//getWeatherData();
searchButtonEl.addEventListener('click', function() {
    startWeatherLoad();
});

document.addEventListener('keydown', function(e) {
    if(e.key === 'Enter') {
        startWeatherLoad();
    }
});

function startWeatherLoad() {
    CITY_NAME = inputValueEl.value;
    if(CITY_NAME != "")
    {
        API_URL = `http://api.openweathermap.org/data/2.5/weather?q=${CITY_NAME}&appid=${API_KEY}`;
        getWeatherData().then(weatherData => {
            weatherDataObject = weatherData; // Allowing my API data to be accessible everywhere, probably not best practice but it works for my needs right now
            displayCurrentWeatherForecast(weatherDataObject);
            console.log(weatherDataObject);  //Check the API data
        });
        updateUnits();
    } else {
        alert('Please enter a city name');
    }
}

unitToggleButton.addEventListener('click', function() {
    let metricUnits = !isMetric();
    metricRadio.checked = metricUnits;
    impreialRadio.checked = !metricUnits;
    displayCurrentWeatherForecast(weatherDataObject);
    updateUnits();
})

metricRadio.addEventListener('click', function() {
    displayCurrentWeatherForecast(weatherDataObject);
    updateUnits();
})

impreialRadio.addEventListener('click', function() {
    displayCurrentWeatherForecast(weatherDataObject);
    updateUnits();
})

async function getWeatherData() {
    return fetch(API_URL)
        .then((response) => {
            if(response.ok) {
                return response.json();
            } else {
                return;
            }
        })
        .then((data) => {
            return data; //This does return all the data though, so not great if the JSON is massive!
            //Old way! Caused issue with accessing data later in the script. Makes this stand alone.
            //console.log(data); //Check the API data
            //displayCurrentWeatherForecast(data);
    })
    .catch(err => {
        //Catch any network errors here (this doesnt include 404 etc...)
        alert('Not a city name')
        return Promise.reject();
    })
}

function displayCurrentWeatherForecast(data) {
    weatherDataEl.classList.remove('hidden');
    searchBarShiftEl.classList.add('container__shift');
    currentLocationEl.innerText = data.name;
    currentMaxTempEl.innerText = displayTemperature(data.main.temp_max);
    currentMinTempEl.innerText = displayTemperature(data.main.temp_min);
    windSpeedEl.innerText = displaySpeed(data.wind.speed);
    windDirArrowEl.style.setProperty('--direction', `${data.wind.deg}deg`);
    windDirTextEl.innerText = getDirection(data.wind.deg);

    //currentDateEl.innerText = displayDate(new Date((data.dt * 1000)));
    currentDateEl.innerText = displayDate(data.dt, data.timezone);
    currentTimeEl.innerText = moment().utcOffset(data.timezone / 60).format("h:mm A");
}

/*
    Farenheit to Celsius
    F° to C° = (°F - 32) / 1.8
    F° to K  = ((°F - 32) / 1.8) + 273.15

    Celsius to Farenheit
    C° to F° = (°C * 1.8) + 32
    C° to K  = °C + 273.15

    Kelvin to Others
    K to C° = K - 273.15
    K to F° = ((K - 273.15) * 1.8) + 32
*/
function displayTemperature(temp) {
    //convert to celsius from Kelvin 
    let tempCelsius = temp - 273.15;
    let returnTemp = tempCelsius;
    if(!isMetric()) {
        //Convert to Farenheit
        returnTemp = tempCelsius * (9 / 5) + 32;
    } else {
        Math.round(returnTemp * 10) / 10;
    }
    return Math.round(returnTemp);
}


function displaySpeed(speed) {
    let returnSpeed = speed;
    if(!isMetric()) {
        returnSpeed = speed / 1.609
    }
    return Math.round(returnSpeed * 10) / 10;
}

//Get direction using degrees
function getDirection(angle) {
    let directions = ['North', 'North-West', 'West', 'South-West', 'South', 'South-East', 'East', 'North-East'];
    return directions[Math.round(((angle %= 360) < 0 ? angle + 360 : angle) / 45) % 8];
}

//Format the Date value in the API to my format.
function displayDate(date, timezone) {
    let currTime = moment().utcOffset(timezone / 60).format("dddd, MMMM Do YYYY");
    return currTime;
    //console.log(currTime);
}

function updateUnits() {
    const speedUnits = document.querySelectorAll('[data-temp-speed]');
    const tempUnits = document.querySelectorAll('[data-temp-unit]');
    speedUnits.forEach(unit => { 
        unit.innerText = isMetric() ? 'kph' : 'mph'
    })
    tempUnits.forEach(unit => { 
        unit.innerText = isMetric() ? 'C' : 'F'
    })
}

function isMetric() {
    return metricRadio.checked;
}

function lettersOnly(input) {
    let regex = /[^A-Za-z\s]+$/g; //lowercase/Uppercase & spaces.
    input.value = input.value.replace(regex, "");
}
//Attempted to do a 7-day forecast with a Map but you need a license to OpenWeather API 😢
/*function getWeatherData() {
    return fetch(API_URL)
        .then((response) => response.json())
        .then((data) => {
            const {
                base,
                clouds,
                cod,
                coord,
                id,
                visibility,
                ...weatherData
            } = data
            console.log(weatherData);
            const temp = data.map(item => ({
                    name: data.name,
                    maxTemp: data.main.temp_max,
                    minTemp: data.main.temp_min,
                    region: data.sys.country,
                    weatherType: data.weather[0].main,
                    weatherIcon: data.weather[0].icon,
                    windSpeed: data.wind.speed,
                    windDegree: data.wind.deg
            }))
            console.log(temp);
    })
}*/