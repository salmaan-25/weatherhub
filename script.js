// Your OpenCage Geocoding API key
const geocodingApiKey = "c3c697a0970f4948a98ff54e85756a07"; 

// Open-Meteo API URL for weather
const meteoApiUrl = "https://api.open-meteo.com/v1/forecast";

// Function to fetch latitude and longitude from city name
async function getCoordinates(cityName) {
  const geocodingUrl = `https://api.opencagedata.com/geocode/v1/json?q=${cityName}&key=${geocodingApiKey}`;

  try {
    const response = await fetch(geocodingUrl);
    const data = await response.json();
    
    if (data.results.length > 0) {
      // Extract latitude and longitude from the response
      const latitude = data.results[0].geometry.lat;
      const longitude = data.results[0].geometry.lng;
      const locationName = data.results[0].formatted;

      // Once we have the coordinates, fetch weather data
      fetchWeatherData(latitude, longitude, locationName);
    } else {
      alert("City not found, please try again.");
    }
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    alert("Failed to get coordinates.");
  }
}

// Function to fetch weather data from Open-Meteo API using latitude and longitude
async function fetchWeatherData(latitude, longitude, locationName) {
  const weatherUrl = `${meteoApiUrl}?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;

  try {
    const response = await fetch(weatherUrl);
    const data = await response.json();

    // Log the data for debugging
    console.log(data);

    // Get dates, max temperature, min temperature, and precipitation data
    const dates = data.daily.time;
    const maxTemps = data.daily.temperature_2m_max;
    const minTemps = data.daily.temperature_2m_min;
    const precipitation = data.daily.precipitation_sum;

    // Format the dates for better display
    const formattedDates = dates.map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    // Display the data on the dashboard
    displayWeatherData(dates, maxTemps, minTemps, precipitation, locationName);

    // Plot the data using Chart.js
    plotWeatherChart(formattedDates, maxTemps, minTemps, precipitation);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    alert("Failed to fetch weather data.");
  }
}

// Function to display weather data on the page
function displayWeatherData(dates, maxTemps, minTemps, precipitation, locationName) {
  let output = `<h3>Weather Forecast for ${locationName || 'Location'}</h3>`;
  
  // Limit to 5 days for mobile-friendly view
  const displayDays = window.innerWidth < 768 ? 5 : dates.length;
  
  for (let i = 0; i < displayDays; i++) {
    const date = new Date(dates[i]);
    const formattedDate = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    
    output += `
      <p><strong>${formattedDate}</strong><br>
        Max: ${maxTemps[i]}°C | Min: ${minTemps[i]}°C | Rain: ${precipitation[i]} mm
      </p>
    `;
  }
  
  if (displayDays < dates.length) {
    output += `<p><small>(Showing ${displayDays} of ${dates.length} days. Full forecast visible in chart below)</small></p>`;
  }
  
  document.getElementById('weather-output').innerHTML = output;
}

// Function to plot weather data using Chart.js
function plotWeatherChart(dates, maxTemps, minTemps, precipitation) {
  // Destroy previous chart if it exists
  const chartContainer = document.getElementById('weatherChart');
  if (chartContainer._chart) {
    chartContainer._chart.destroy();
  }
  
  const ctx = chartContainer.getContext('2d');
  
  // Determine if we're on mobile
  const isMobile = window.innerWidth < 768;
  
  // Create new chart with responsive options
  const newChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'Max °C',
          data: maxTemps,
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          borderWidth: 2,
          tension: 0.1,
          fill: false
        },
        {
          label: 'Min °C',
          data: minTemps,
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          borderWidth: 2,
          tension: 0.1,
          fill: false
        },
        {
          label: 'Rain (mm)',
          data: precipitation,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          borderWidth: 2,
          tension: 0.1,
          fill: false,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: isMobile ? 'bottom' : 'top',
          labels: {
            boxWidth: isMobile ? 12 : 40,
            font: {
              size: isMobile ? 10 : 12
            }
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          ticks: {
            maxRotation: isMobile ? 45 : 0,
            font: {
              size: isMobile ? 9 : 12
            }
          }
        },
        y: {
          beginAtZero: false,
          title: {
            display: !isMobile,
            text: 'Temperature (°C)'
          },
          ticks: {
            font: {
              size: isMobile ? 9 : 12
            }
          }
        },
        y1: {
          type: 'linear',
          position: 'right',
          beginAtZero: true,
          title: {
            display: !isMobile,
            text: 'Precipitation (mm)'
          },
          ticks: {
            font: {
              size: isMobile ? 9 : 12
            }
          },
          grid: {
            drawOnChartArea: false
          }
        }
      }
    }
  });
  
  // Store chart instance for future reference
  chartContainer._chart = newChart;
}

// Function to handle the search when a button is clicked
document.getElementById('fetchWeatherBtn').addEventListener('click', function() {
  const cityName = document.getElementById('cityInput').value;
  if (cityName) {
    getCoordinates(cityName);
  } else {
    alert("Please enter a city name.");
  }
});

// Handle Enter key press in the input field
document.getElementById('cityInput').addEventListener('keypress', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    document.getElementById('fetchWeatherBtn').click();
  }
});

// Handle window resize to update chart responsiveness
window.addEventListener('resize', function() {
  const weatherOutput = document.getElementById('weather-output');
  if (weatherOutput.innerHTML !== '') {
    const chart = document.getElementById('weatherChart')._chart;
    if (chart) {
      chart.options.plugins.legend.position = window.innerWidth < 768 ? 'bottom' : 'top';
      chart.options.scales.x.ticks.maxRotation = window.innerWidth < 768 ? 45 : 0;
      chart.update();
    }
  }
});

// Check if service worker is supported
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('service-worker.js')
    .then(() => console.log("✅ Service Worker Registered"))
    .catch(error => console.log("❌ Service Worker Error:", error));
}