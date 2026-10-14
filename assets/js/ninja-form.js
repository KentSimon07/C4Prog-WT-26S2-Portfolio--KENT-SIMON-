
// Get HTML elements
const jokes = document.getElementById('jokes');
const airquality = document.getElementById('airquality');
const apiInput = document.getElementById('api-input');
const apiResponse = document.getElementById('api-response');
const form = document.getElementById('ninja-form');

// Use a valid API key for local testing only
const API_KEY = 'YOUR_API_KEY';

// Keep track of requests
let requestId = 0;

// Clear the input and response
function clearFields() {
    requestId++;
    apiInput.value = '';
    apiResponse.textContent = '';
}

// Jokes checkbox
jokes.addEventListener('change', () => {
    if (jokes.checked) {
        airquality.checked = false;
    }

    clearFields();

    if (jokes.checked) {
        apiInput.placeholder = 'Number of jokes (1-5)';
    } else {
        apiInput.placeholder = 'Select an API first';
    }
});

// Air Quality checkbox
airquality.addEventListener('change', () => {
    if (airquality.checked) {
        jokes.checked = false;
    }

    clearFields();

    if (airquality.checked) {
        apiInput.placeholder = 'Enter a city (e.g. Perth)';
    } else {
        apiInput.placeholder = 'Select an API first';
    }
});

// Submit form
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Clear previous response
    apiResponse.textContent = '';

    const currentRequest = ++requestId;
    const userInput = apiInput.value.trim();

    let url;
    let count = 1;

    // Jokes API
    if (jokes.checked) {
        count = Number(userInput);

        if (!Number.isInteger(count) || count < 1 || count > 5) {
            apiResponse.textContent = 'Enter a number between 1 and 5.';
            return;
        }

        url = 'https://api.api-ninjas.com/v1/jokes';

    // Air Quality API
    } else if (airquality.checked) {
        if (userInput === '') {
            apiResponse.textContent = 'Please enter a city.';
            return;
        }

        url = 'https://api.api-ninjas.com/v1/airquality?city='
            + encodeURIComponent(userInput);

    } else {
        apiResponse.textContent = 'Please select an API.';
        return;
    }

    // Display loading message
    apiResponse.textContent = 'Loading...';

    try {
        const results = [];

        // Fetch API results
        for (let i = 0; i < count; i++) {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'X-Api-Key': API_KEY
                }
            });

            // Convert the response into JavaScript data
            const data = await response.json().catch(() => null);

            // Ignore outdated requests
            if (currentRequest !== requestId) {
                return;
            }

            // Handle HTTP errors
            if (!response.ok) {
                const message = data?.error || data?.message
                    || `API request failed (HTTP ${response.status}).`;

                throw new Error(message);
            }

            if (data === null) {
                throw new Error('Invalid API response.');
            }

            // Jokes response
            if (jokes.checked) {
                if (!Array.isArray(data) || !data[0]?.joke) {
                    throw new Error('No jokes were returned.');
                }

                results.push(data[0].joke);
            }

            // Air Quality response
            else if (airquality.checked) {
                if (typeof data.overall_aqi !== 'number') {
                    throw new Error('No air quality data was returned.');
                }

                const airQuality = [
                    'City: ' + userInput,
                    'Overall AQI: ' + data.overall_aqi,
                    'CO: ' + (data.CO?.concentration ?? 'N/A') + ' µg/m³',
                    'NO2: ' + (data.NO2?.concentration ?? 'N/A') + ' µg/m³',
                    'O3: ' + (data.O3?.concentration ?? 'N/A') + ' µg/m³',
                    'SO2: ' + (data.SO2?.concentration ?? 'N/A') + ' µg/m³',
                    'PM2.5: ' + (data['PM2.5']?.concentration ?? 'N/A') + ' µg/m³',
                    'PM10: ' + (data.PM10?.concentration ?? 'N/A') + ' µg/m³'
                ];

                results.push(airQuality.join('\n'));
            }
        }

        // Display results
        if (currentRequest === requestId) {
            apiResponse.textContent = results.join('\n\n');
        }

    } catch (error) {
        // Display errors
        if (currentRequest === requestId) {
            apiResponse.textContent = 'Error: ' + error.message;
        }
    }
});
