// INTERAÇÃO
const citySearchInput = document.getElementById('city-search-input')
const citySearchButton = document.getElementById('city-search-button')
const themeToggleButton = document.getElementById('theme-toggle-button')
const themeToggleIcon = themeToggleButton?.querySelector('img')
const citySearchButtonIcon = citySearchButton?.querySelector('img');

// EXIBIÇÃO
const currentDate = document.getElementById('current-date')
const cityName = document.getElementById('city-name')
const weatherIcon = document.getElementById('weather-icon')
const weatherDescription = document.getElementById('weather-description')
const currentTemperature = document.getElementById('current-temperature')
const windSpeed = document.getElementById('wind-speed')
const thermalSensation = document.getElementById('thermal-sensation')
const currentHumidity = document.getElementById('humidity')
const sunriseTime = document.getElementById('sunrise-time')
const sunsetTime = document.getElementById('sunset-time')

const WEATHER_API_URL = "https://snapclima-one.vercel.app/api/weather"

citySearchButton.addEventListener("click", () => {
    let cityName = citySearchInput.value
    getCityWeather(cityName)
})

navigator.geolocation.getCurrentPosition(
    (position) => {
        let lat = position.coords.latitude
        let lon = position.coords.longitude

        getCurrentLocationWeather(lat, lon)
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

async function getCityWeather(cityName) {
  weatherIcon.src = "./assets/loading-icon.svg";

  try {
    const response = await fetch(`${WEATHER_API_URL}?city=${cityName}`);
    const data = await response.json();

    const cityNotFound =
      String(data?.message || "").toLowerCase() === "city not found";

    if (!response.ok) {
      throw new Error(cityNotFound ? "Cidade não encontrada" : "Erro ao buscar cidade");
    }

    displayWeather(data);
  } catch (error) {
    const message =
      String(error?.message || "").toLowerCase() === "cidade não encontrada"
        ? "Cidade não encontrada"
        : "Erro ao buscar dados do tempo da cidade. tente novamente.";

    console.error(message);
    alert(message);
  }
}

async function getCurrentLocationWeather(lat, lon) {

    const response = await fetch(`${WEATHER_API_URL}?lat=${lat}&lon=${lon}`)
    const data = await response.json();

    try{
        displayWeather(data);
    }
    catch(error){
        console.error("Erro ao buscar informações: ", error)
        alert("Erro ao buscar dados de localização.")    
    }
}

function toggleTheme() {
    const darkThemeIsActive = document.body.classList.toggle('dark')

    if (darkThemeIsActive) {
        citySearchButtonIcon.src = './assets/dark-search-icon.png'
        themeToggleIcon.src = './assets/light-theme-icon.png'
        themeToggleIcon.alt = 'Alternar para tema claro'
        return
    }

    citySearchButtonIcon.src = './assets/light-search-icon.png'
    themeToggleIcon.src = './assets/dark-theme-icon.png'
    themeToggleIcon.alt = 'Alternar para tema escuro'
}

if (themeToggleButton && themeToggleIcon) {
    themeToggleButton.addEventListener('click', toggleTheme)
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
    cityName.textContent = name
    weatherIcon.src = `./assets/${icon}.svg`
    weatherDescription.textContent = description
    currentTemperature.textContent = `${Math.round(temp)}ºC`
    windSpeed.textContent = `${Math.round(speed * 3.6)}km/h`
    thermalSensation.textContent = `${Math.round(feels_like)}ºC`
    currentHumidity.textContent = `${humidity}%`
    sunriseTime.textContent = formatTime(sunrise, timezone)
    sunsetTime.textContent = formatTime(sunset, timezone)
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