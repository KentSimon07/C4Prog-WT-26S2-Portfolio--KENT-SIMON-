

const emoji = document.getElementById('emoji');
const airquality = document.getElementById('airquality');
const apiInput = document.getElementById('api-input');
const apiResponse = document.getElementById('api-response');
const form = document.getElementById('ninja-form');


const API_KEY = 'YOUR_API_KEY';

let requestId = 0;


function clearFields() {
    requestId++;
    apiInput.value = '';
    apiResponse.textContent = '';
}


emoji.addEventListener('change', () => {
    if (emoji.checked) {
        airquality.checked = false;
    }

    clearFields();

    if (emoji.checked) {
        apiInput.placeholder = 'Enter an emoji name (e.g. smile)';
    } else {
        apiInput.placeholder = 'Select an API first';
    }
});


airquality.addEventListener('change', () => {
    if (airquality.checked) {
        emoji.checked = false;
    }

    clearFields();

    if (airquality.checked) {
        apiInput.placeholder = 'Enter a city (e.g. Perth)';
    } else {
        apiInput.placeholder = 'Select an API first';
    }
});


form.addEventListener('submit', async (event) => {
    event.preventDefault();


    apiResponse.textContent = '';

    const currentRequest = ++requestId;
    const userInput = apiInput.value.trim();

    let url;


    if (userInput === '') {
        apiResponse.textContent = 'Please enter a value.';
        return;
    }


    if (emoji.checked) {
        url = 'https://api.api-ninjas.com/v1/emoji?name='
            + encodeURIComponent(userInput);

    } else if (airquality.checked) {
        url = 'https://api.api-ninjas.com/v1/airquality?city='
            + encodeURIComponent(userInput);

    } else {
        apiResponse.textContent = 'Please select an API.';
        return;
    }

    apiResponse.textContent = 'Loading...';

    try {

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Api-Key': API_KEY
            }
        });

        const data = await response.json().catch(() => null);


        if (currentRequest !== requestId) {
            return;
        }

        if (!response.ok) {
            throw new Error(
                data?.error || data?.message
                || `API request failed (${response.status}).`
            );
        }

        if (data === null) {
            throw new Error('Invalid API response.');
        }

        if (emoji.checked) {
            if (!Array.isArray(data) || data.length === 0) {
                apiResponse.textContent = 'No emojis found.';
                return;
            }

            const results = [];

            data.forEach((item) => {
                results.push(item.character + ' ' + item.name);
            });

            apiResponse.textContent = results.join('\n');
        }

        else if (airquality.checked) {
            if (typeof data.overall_aqi !== 'number') {
                throw new Error('No air quality data found.');
            }

            apiResponse.textContent =
                'City: ' + userInput + '\n' +
                'Overall AQI: ' + data.overall_aqi + '\n' +
                'CO: ' + (data.CO?.concentration ?? 'N/A') + ' µg/m³\n' +
                'NO2: ' + (data.NO2?.concentration ?? 'N/A') + ' µg/m³\n' +
                'O3: ' + (data.O3?.concentration ?? 'N/A') + ' µg/m³\n' +
                'SO2: ' + (data.SO2?.concentration ?? 'N/A') + ' µg/m³\n' +
                'PM2.5: ' + (data['PM2.5']?.concentration ?? 'N/A') + ' µg/m³\n' +
                'PM10: ' + (data.PM10?.concentration ?? 'N/A') + ' µg/m³';
        }

    } catch (error) {
        if (currentRequest === requestId) {
            apiResponse.textContent = 'Error: ' + error.message;
        }
    }
});
