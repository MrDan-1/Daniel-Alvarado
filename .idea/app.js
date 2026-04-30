// Weather App JavaScript

const apiKey = "343520886712861a9af7acb14decb15f"; //OpenWeatherMap API key
const apiUrl = "https://api.openweathermap.org/data/2.5/weather"; // API base URL

// Grab elements from HTML
const cityInput = document.getElementById("cityInput"); // Gets the input field
const searchBtn = document.getElementById("searchBtn"); // Gets the search button
const weatherCard = document.getElementById("weatherCard"); // Gets the weather card
const cityName = document.getElementById("cityName"); // Gets city name element
const temperature = document.getElementById("temperature"); // Gets temperature element
const condition = document.getElementById("condition"); // Gets condition element
const humidity = document.getElementById("humidity"); // Gets humidity element
const wind = document.getElementById("wind"); // Gets wind element
const weatherIcon = document.getElementById("weatherIcon"); // Gets icon element
const errorMsg = document.getElementById("errorMsg"); // Gets error message element

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

// Main fetch weather function
async function getWeather() { // Async allows us to await API
    const city = cityInput.value.trim(); // Gets and cleans input value

    if (!city) { // Checks if input is empty
        errorMsg.textContent = "Please enter a city name."; // Shows empty error
        return; // Stops function early
    }

    errorMsg.textContent = ""; // Clears any old error
    weatherCard.classList.remove("show"); // Hides old weather card

    try { // Tries to fetch data
        const response = await fetch( // Fetches from API
            `${apiUrl}?q=${city}&appid=${apiKey}&units=imperial` // Builds API URL with city
        );

        if (!response.ok) { // Checks if response failed
            throw new Error("City not found"); // Throws error if bad response
        }

        const data = await response.json(); // Converts response to JSON

        // Populate weather card with data
        cityName.textContent = data.name; // Sets city name
        temperature.textContent = `${Math.round(data.main.temp)}°F`; // Sets rounded temperature
        condition.textContent = data.weather[0].description; // Sets weather description
        humidity.textContent = `Humidity: ${data.main.humidity}%`; // Sets humidity value
        wind.textContent = `Wind: ${Math.round(data.wind.speed)} mph`; // Sets wind speed
        weatherIcon.textContent = getWeatherIcon(data.weather[0].id); // Sets dynamic icon

        weatherCard.classList.add("show"); // Shows the weather card

    } catch (error) { // Catches any errors
        errorMsg.textContent = "City not found. Please try again."; // Shows error message
    }
}

// Button click event
searchBtn.addEventListener("click", getWeather); // Runs getWeather on click

// Enter key event
cityInput.addEventListener("keypress", function (e) { // Listens for key press
    if (e.key === "Enter") getWeather(); // Runs getWeather on Enter
});