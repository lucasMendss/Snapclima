// interaction vars
const locationSearchInput = document.getElementById('location-search-input')
const locationSearchButton = document.getElementById('location-search-button')
const locationSearchButtonIcon = locationSearchButton?.querySelector('img');
const currentLocationSearchButton = document.getElementById('current-location-search-button')
const themeToggleButton = document.getElementById('theme-toggle-button')
const themeToggleIcon = themeToggleButton?.querySelector('img')
const temperatureUnitButton = document.querySelector('.header__temperature-unit-button')

// display vars
const currentDate = document.getElementById('current-date')
const locationName = document.getElementById('location-name')
const weatherIcon = document.getElementById('weather-icon')
const weatherDescription = document.getElementById('weather-description')
const currentTemperature = document.getElementById('current-temperature')
const windSpeed = document.getElementById('wind-speed')
const thermalSensation = document.getElementById('thermal-sensation')
const currentHumidity = document.getElementById('humidity');
const sunriseTime = document.getElementById('sunrise-time');
const sunsetTime = document.getElementById('sunset-time');

// backend vars
const WEATHER_API_URL = "https://snapclima-one.vercel.app/api/weather";
let isCelsiusUnitActive = true;

requestCurrentLocationWeather();

if (themeToggleButton && themeToggleIcon) {
    themeToggleButton.addEventListener('click', toggleTheme)
}

if (temperatureUnitButton) {
    temperatureUnitButton.addEventListener('click', toggleTemperatureUnitOfMeasure)
}

if (currentLocationSearchButton) {
    currentLocationSearchButton.addEventListener("click", requestCurrentLocationWeather);
}

locationSearchButton.addEventListener("click", () => {
    getAndDisplayLocationWeather(locationSearchInput.value);
})

function toggleTheme() {
    const darkThemeIsActive = document.body.classList.toggle('dark')

    if (darkThemeIsActive) {
        locationSearchButtonIcon.src = './assets/dark-search-icon.png'
        themeToggleIcon.src = './assets/light-theme-icon.png'
        themeToggleIcon.alt = 'Alternar para tema claro'
        return
    }

    locationSearchButtonIcon.src = './assets/light-search-icon.png'
    themeToggleIcon.src = './assets/dark-theme-icon.png'
    themeToggleIcon.alt = 'Alternar para tema escuro'
}

function toggleTemperatureUnitOfMeasure() {
    const temperatureFields = document.querySelectorAll('.has-temperature-unit')

    if (!temperatureFields.length) {
        return
    }

    temperatureFields.forEach((temperatureField) => {
        const numericText = temperatureField.textContent?.replace('ºC', '').replace('ºF', '').trim()
        const parsedValue = Number(numericText)

        if (Number.isNaN(parsedValue)) {
            return
        }

        const convertedValue = isCelsiusUnitActive
            ? (parsedValue * 9) / 5 + 32
            : ((parsedValue - 32) * 5) / 9

        const nextUnit = isCelsiusUnitActive ? 'ºF' : 'ºC'
        temperatureField.textContent = `${Math.round(convertedValue)}${nextUnit}`
    })

    isCelsiusUnitActive = !isCelsiusUnitActive
    temperatureUnitButton.textContent = isCelsiusUnitActive ? 'ºF' : 'ºC'
}

function requestCurrentLocationWeather() {
    locationSearchInput.value = "";

    navigator.geolocation.getCurrentPosition(
        (position) => {
            let lat = position.coords.latitude
            let lon = position.coords.longitude

            getAndDisplayCurrentLocationWeather(lat, lon)
        },
        (err) => {
            if (err.code === 1) {
                const errorMessage = "Geolocalização automática negada pelo usuário. Busque manualmente por uma cidade usando a barra de pesquisa."
                console.log(errorMessage);
                alert(errorMessage);
            }
            else {
                console.log('Erro: ' + err.message);
            }
        }
    )
}

// get and display weather functions
async function getAndDisplayLocationWeather(locationName) {
    weatherIcon.src = "./assets/loading-icon.svg";

    try {
        const response = await fetch(`${WEATHER_API_URL}?location=${locationName}`);
        const data = await response.json();

        const locationNotFound =
            String(data?.message || "").toLowerCase() === "location not found";

        if (!response.ok) {
            throw new Error(locationNotFound ? "Cidade não encontrada" : "Erro ao buscar cidade");
        }

        displayWeather(data);
    } catch (error) {
        const message =
            String(error?.message || "").toLowerCase() === "cidade não encontrada"
                ? "Cidade não encontrada"
                : "Erro ao buscar dados do tempo da cidade. Tente novamente.";

        console.error(message);
        alert(message);
    }
}

async function getAndDisplayCurrentLocationWeather(lat, lon) {
    const response = await fetch(`${WEATHER_API_URL}?lat=${lat}&lon=${lon}`)
    const data = await response.json();

    try {
        displayWeather(data);
    }
    catch (error) {
        console.error("Erro ao buscar informações: ", error)
        alert("Erro ao buscar informações: ", error)
    }
}

function displayWeather(data) {
    let {
        dt,
        name,
        weather: [{ icon, description }],
        main: { temp, feels_like, humidity },
        wind: { speed },
        sys: { sunrise, sunset },
        timezone,
    } = data

    currentDate.textContent = `${formatDate(dt, timezone)}`
    locationName.textContent = name
    weatherIcon.src = `./assets/${icon}.svg`
    weatherDescription.textContent = description
    currentTemperature.textContent = `${Math.round(temp)}ºC`
    windSpeed.textContent = `${Math.round(speed * 3.6)}km/h`
    thermalSensation.textContent = `${Math.round(feels_like)}ºC`
    currentHumidity.textContent = `${humidity}%`
    sunriseTime.textContent = formatTime(sunrise, timezone)
    sunsetTime.textContent = formatTime(sunset, timezone)

    isCelsiusUnitActive = true
    if (temperatureUnitButton) {
        temperatureUnitButton.textContent = 'ºF'
    }
}

function formatDate(dateTime, timezone) {
    const localTime = new Date((dateTime + timezone) * 1000);

    const day = localTime.getUTCDate();
    const month = localTime.toLocaleString('pt-BR', { month: 'long', timeZone: 'UTC' });
    const hours = String(localTime.getUTCHours()).padStart(2, '0');
    const minutes = String(localTime.getUTCMinutes()).padStart(2, '0');

    return `Hoje, ${day} de ${month}, ${hours}:${minutes}`;
}

function formatTime(time, timezone) {
    const localTime = new Date((time + timezone) * 1000);

    const hours = String(localTime.getUTCHours()).padStart(2, '0');
    const minutes = String(localTime.getUTCMinutes()).padStart(2, '0');

    return `${hours}h${minutes}`
}