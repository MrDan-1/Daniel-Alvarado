// Weather App JavaScript

const apiKey = "343520886712861a9af7acb14decb15f"; //API key
const apiUrl = "https://api.openweathermap.org/data/2.5/weather"; // Current weather URL
const forecastUrl = "https://api.openweathermap.org/data/2.5/forecast"; // 5 day forecast URL
const uvUrl = "https://api.openweathermap.org/data/2.5/uvi"; // UV index URL

// Grab elements from HTML
const cityInput = document.getElementById("cityInput"); // Gets the input field
const searchBtn = document.getElementById("searchBtn"); // Gets the search button
const toggleUnit = document.getElementById("toggleUnit"); // Gets the toggle button
const weatherCard = document.getElementById("weatherCard"); // Gets the weather card
const cityName = document.getElementById("cityName"); // Gets city name element
const temperature = document.getElementById("temperature"); // Gets temperature element
const condition = document.getElementById("condition"); // Gets condition element
const humidity = document.getElementById("humidity"); // Gets humidity element
const wind = document.getElementById("wind"); // Gets wind element
const weatherIcon = document.getElementById("weatherIcon"); // Gets icon element
const errorMsg = document.getElementById("errorMsg"); // Gets error message element
const forecastContainer = document.getElementById("forecastContainer"); // Gets forecast container
const forecastCards = document.getElementById("forecastCards"); // Gets forecast cards div
const localTime = document.getElementById("localTime"); // Gets local time element
const uvIndex = document.getElementById("uvIndex"); // Gets UV index element

// Track current unit and temp
let isCelsius = false; // Tracks if celsius is active
let currentTempF = null; // Stores current temp in fahrenheit
let forecastTempsF = []; // Stores forecast temps in fahrenheit

// Weather icon mapper
function getWeatherIcon(conditionCode) { // Takes condition code from API
    if (conditionCode >= 200 && conditionCode < 300) return "⛈️"; // Thunderstorm range
    if (conditionCode >= 300 && conditionCode < 400) return "🌦️"; // Drizzle range
    if (conditionCode >= 500 && conditionCode < 600) return "🌧️"; // Rain range
    if (conditionCode >= 600 && conditionCode < 700) return "❄️"; // Snow range
    if (conditionCode >= 700 && conditionCode < 800) return "🌫️"; // Fog/mist range
    if (conditionCode === 800) return "☀️"; // Clear sky
    if (conditionCode > 800) return "☁️"; // Cloudy conditions
    return "🌤️"; // Default fallback icon
}

// Get day name from date
function getDayName(dateStr) { // Takes date string from API
    const date = new Date(dateStr); // Converts string to date
    return date.toLocaleDateString("en-US", { weekday: "short" }); // Returns short day name
}

// Convert fahrenheit to celsius
function toCelsius(f) { // Takes fahrenheit value
    return Math.round((f - 32) * 5 / 9); // Returns celsius value
}

// Get local time from timezone offset
function getLocalTime(timezoneOffset) { // Takes timezone offset in seconds
    const utc = Date.now() + new Date().getTimezoneOffset() * 60000; // Gets UTC time
    const local = new Date(utc + timezoneOffset * 1000); // Adds city offset
    return local.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }); // Returns formatted time
}

// Get UV index label
function getUVLabel(uv) { // Takes UV number
    if (uv <= 2) return "Low"; // Low UV range
    if (uv <= 5) return "Moderate"; // Moderate UV range
    if (uv <= 7) return "High"; // High UV range
    if (uv <= 10) return "Very High"; // Very high UV range
    return "Extreme"; // Extreme UV range
}

// Background theme changer
function setBackground(conditionCode, sunrise, sunset) { // Takes condition and sun times
    const now = Math.floor(Date.now() / 1000); // Gets current time in seconds
    document.body.classList.remove("sunny", "cloudy", "night"); // Removes old classes

    if (now < sunrise || now > sunset) { // Checks if it is night time
        document.body.classList.add("night"); // Applies night background
    } else if (conditionCode === 800) { // Checks if clear sky
        document.body.classList.add("sunny"); // Applies sunny background
    } else { // Everything else is cloudy or rainy
        document.body.classList.add("cloudy"); // Applies cloudy background
    }
}

// Main fetch weather function
async function getWeather() { // Async allows us to await API
    const city = cityInput.value.trim(); // Gets and cleans input value

    if (!city) { // Checks if input is empty
        errorMsg.textContent = "Please enter a city name."; // Shows empty error
        return; // Stops function early
    }

    errorMsg.textContent = ""; // Clears any old error
    weatherCard.classList.remove("show"); // Hides old weather card
    forecastContainer.classList.remove("show"); // Hides old forecast

    try { // Tries to fetch data
        // Fetch current weather
        const response = await fetch( // Fetches current weather
            `${apiUrl}?q=${city}&appid=${apiKey}&units=imperial` // Builds current weather URL
        );

        if (!response.ok) { // Checks if response failed
            throw new Error("City not found"); // Throws error if bad response
        }

        const data = await response.json(); // Converts response to JSON

        // Store temp and coords for later use
        currentTempF = data.main.temp; // Saves fahrenheit temp
        const lat = data.coord.lat; // Gets latitude
        const lon = data.coord.lon; // Gets longitude

        // Populate current weather card
        cityName.textContent = data.name; // Sets city name
        localTime.textContent = `🕒 ${getLocalTime(data.timezone)}`; // Sets local time
        temperature.textContent = `${Math.round(currentTempF)}°F`; // Sets rounded temperature
        condition.textContent = data.weather[0].description; // Sets weather description
        humidity.textContent = `Humidity: ${data.main.humidity}%`; // Sets humidity value
        wind.textContent = `Wind: ${Math.round(data.wind.speed)} mph`; // Sets wind speed
        weatherIcon.textContent = getWeatherIcon(data.weather[0].id); // Sets dynamic icon

        // Fetch UV index
        const uvResponse = await fetch( // Fetches UV index data
            `${uvUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}` // Builds UV URL with coords
        );
        const uvData = await uvResponse.json(); // Converts UV response to JSON
        const uvValue = Math.round(uvData.value); // Rounds UV value
        uvIndex.textContent = `UV Index: ${uvValue} (${getUVLabel(uvValue)})`; // Sets UV index text

        setBackground(data.weather[0].id, data.sys.sunrise, data.sys.sunset); // Sets background theme

        weatherCard.classList.add("show"); // Shows the weather card

        // Fetch 5 day forecast
        const forecastResponse = await fetch( // Fetches forecast data
            `${forecastUrl}?q=${city}&appid=${apiKey}&units=imperial` // Builds forecast URL
        );

        const forecastData = await forecastResponse.json(); // Converts forecast to JSON

        forecastCards.innerHTML = ""; // Clears old forecast cards
        forecastTempsF = []; // Clears old forecast temps

        // Filter one forecast per day
        const dailyForecasts = forecastData.list.filter(item => // Loops through forecast list
            item.dt_txt.includes("12:00:00") // Gets only noon readings
        );

        // Build forecast cards
        dailyForecasts.forEach(day => { // Loops through each day
            forecastTempsF.push(day.main.temp); // Saves forecast temp
            const card = document.createElement("div"); // Creates a new div
            card.classList.add("forecast-card"); // Adds forecast card class

            card.innerHTML = `
        <p class="forecast-day">${getDayName(day.dt_txt)}</p>
        <p class="forecast-icon">${getWeatherIcon(day.weather[0].id)}</p>
        <p class="forecast-temp">${Math.round(day.main.temp)}°F</p>
      `; // Fills card with day info

            forecastCards.appendChild(card); // Adds card to forecast section
        });

        forecastContainer.classList.add("show"); // Shows the forecast section
        isCelsius = false; // Resets to fahrenheit on new search
        toggleUnit.textContent = "°C"; // Resets toggle button text

    } catch (error) { // Catches any errors
        errorMsg.textContent = "City not found. Please try again."; // Shows error message
    }
}

// Toggle fahrenheit and celsius
toggleUnit.addEventListener("click", function () { // Listens for toggle click
    isCelsius = !isCelsius; // Flips the unit

    if (isCelsius) { // If switching to celsius
        temperature.textContent = `${toCelsius(currentTempF)}°C`; // Shows celsius temp
        toggleUnit.textContent = "°F"; // Changes button to fahrenheit
        const cards = forecastCards.querySelectorAll(".forecast-temp"); // Gets all forecast temps
        cards.forEach((card, i) => { // Loops through each card
            card.textContent = `${toCelsius(forecastTempsF[i])}°C`; // Updates to celsius
        });
    } else { // If switching back to fahrenheit
        temperature.textContent = `${Math.round(currentTempF)}°F`; // Shows fahrenheit temp
        toggleUnit.textContent = "°C"; // Changes button to celsius
        const cards = forecastCards.querySelectorAll(".forecast-temp"); // Gets all forecast temps
        cards.forEach((card, i) => { // Loops through each card
            card.textContent = `${Math.round(forecastTempsF[i])}°F`; // Updates to fahrenheit
        });
    }
});

// Button click event
searchBtn.addEventListener("click", getWeather); // Runs getWeather on click

// Enter key event
cityInput.addEventListener("keypress", function (e) { // Listens for key press
    if (e.key === "Enter") getWeather(); // Runs getWeather on Enter
});