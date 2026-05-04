var key = '5f6ae1d97fae3dd16d3552178c112bd6';

// The API gives temp in Kelvin so this converts it to Fahrenheit
function convertTemp(k) {
  return Math.round((k - 273.15) * 9/5 + 32);
}

// main function that runs when the user hits search
async function search() {
  var city = document.getElementById('city').value.trim();

  if (city === '') {
    document.getElementById('error').textContent = 'Please enter a city.';
    return;
  }

  document.getElementById('error').textContent = '';
  document.getElementById('results').style.display = 'none';

  // OpenWeather uses lat and lon so this takes the city and gets the lat and lon
  var locationURL = 'https://api.openweathermap.org/geo/1.0/direct?q=' + encodeURIComponent(city + ',US') + '&limit=1&appid=' + key;

  var locationResponse = await fetch(locationURL);
  var locationData = await locationResponse.json();

  if (locationData.length === 0) {
    document.getElementById('error').textContent = 'City not found. Try again.';
    return;
  }

  var lat = locationData[0].lat;
  var lon = locationData[0].lon;
  var cityName = locationData[0].name + ', ' + (locationData[0].state || locationData[0].country);

  // uses the lat and lon to get the 5 day forecast
  var weatherURL = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon + '&cnt=40&appid=' + key;

  var weatherResponse = await fetch(weatherURL);
  var weatherData = await weatherResponse.json();

  // Displays the city and state
  document.getElementById('locationLabel').textContent = cityName;

  // The API sends back data every 3 hours so this groups them by day
  var days = {};
  var timezone = weatherData.city.timezone;

  for (var i = 0; i < weatherData.list.length; i++) {
    var item = weatherData.list[i];
    var date = new Date((item.dt + timezone) * 1000);
    var dayName = date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });

    if (!days[dayName]) {
      days[dayName] = [];
    }
    days[dayName].push(item);
  }

  // Goes through each day and prints the highest temp and weather type
  var outputBox = document.getElementById('forecast');
  outputBox.innerHTML = '';

  var count = 0;
  for (var day in days) {
    if (count >= 5) break;

    var times = days[day];

    // Loop through all the temps that day and find the highest one
    var high = convertTemp(times[0].main.temp);
    for (var j = 0; j < times.length; j++) {
      var temp = convertTemp(times[j].main.temp);
      if (temp > high) {
        high = temp;
      }
    }

    // Gets weather type from the middle of the day
    var midDay = times[Math.floor(times.length / 2)];
    var sky = midDay.weather[0].main;

    outputBox.innerHTML += '<div><strong>' + day + '</strong><br>' + high + '°F — ' + sky + '</div>';
    count++;
  }

  document.getElementById('results').style.display = 'block';
  document.getElementById('resetBtn').style.display = 'inline-block';
}

// Resets everything so the user can enter a new location
function reset() {
  document.getElementById('city').value = '';
  document.getElementById('results').style.display = 'none';
  document.getElementById('resetBtn').style.display = 'none';
  document.getElementById('error').textContent = '';
}

