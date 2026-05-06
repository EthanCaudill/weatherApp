var key = '5f6ae1d97fae3dd16d3552178c112bd6';

// Converts Kelvin to Fahrenheit
function convertTemp(k) {
  return Math.round((k - 273.15) * 9/5 + 32);
}

// Fetches location from users input
async function search() {
  var city = document.getElementById('city').value.trim();

  if (city === '') {
    document.getElementById('error').textContent = 'Please enter a city.';
    return;
  }

  document.getElementById('error').textContent = '';
  document.getElementById('results').style.display = 'none';

  // Converts the city to lat and lon for location
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

  // Fetch 5-day forecast in 3-hour intervals
  var weatherURL = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon + '&cnt=40&appid=' + key;

  var weatherResponse = await fetch(weatherURL);
  var weatherData = await weatherResponse.json();

  document.getElementById('locationLabel').textContent = cityName;

  // Group forecast by day and sets timezone
  var days = {};
  var timezone = weatherData.city.timezone;

  var todayDate = new Date((weatherData.list[0].dt + timezone) * 1000);
  var todayName = todayDate.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });

  for (var i = 0; i < weatherData.list.length; i++) {
    var item = weatherData.list[i];
    var date = new Date((item.dt + timezone) * 1000);
    var dayName = date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });

    if (!days[dayName]) {
      days[dayName] = [];
    }
    days[dayName].push(item);
  }

  // Output for each day showing high, current, and low temps
  var outputBox = document.getElementById('forecast');
  outputBox.innerHTML = '';

  var count = 0;
  for (var day in days) {
    if (count >= 5) break;

    var times = days[day];

    // Find daily high
    var high = convertTemp(times[0].main.temp);
    for (var j = 0; j < times.length; j++) {
      var temp = convertTemp(times[j].main.temp);
      if (temp > high) high = temp;
    }

    // Find daily low
    var low = convertTemp(times[0].main.temp_min);
    for (var j = 0; j < times.length; j++) {
      var temp = convertTemp(times[j].main.temp_min);
      if (temp < low) low = temp;
    }

    // Use midday entry for current temp and sky condition
    var midDay = times[Math.floor(times.length / 2)];
    var sky = midDay.weather[0].main;
    var current = convertTemp(midDay.main.temp);

    // Only show "Now" for today
    var currentHTML = '';
    if (day === todayName) {
    currentHTML = '<span class="temp-current">Now: ' + current + '°F</span>';
    }

    outputBox.innerHTML += '<div class="day-card">'
      + '<div class="day-name">' + day + '</div>'
      + '<div class="day-sky">' + sky + '</div>'
      + '<div class="day-temps">'
      + '<span class="temp-high">H: ' + high + '°F</span>'
      + currentHTML
      + '<span class="temp-low">L: ' + low + '°F</span>'
      + '</div>'
      + '</div>';
    count++;
  }

  document.getElementById('results').style.display = 'block';
  document.getElementById('resetBtn').style.display = 'inline-block';
}

// Clears the input and lets the user enter a new city
function reset() {
  document.getElementById('city').value = '';
  document.getElementById('results').style.display = 'none';
  document.getElementById('resetBtn').style.display = 'none';
  document.getElementById('error').textContent = '';
}
