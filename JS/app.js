// DOM elements
const ipInput = document.getElementById("ip");
const form = document.getElementById("form");
const ipOutput = document.getElementById("ip_addr");
const locationOutput = document.getElementById("loc");
const timezoneOutput = document.getElementById("time");
const ispOutput = document.getElementById("isp");
const errorMessage = document.getElementById("err");
const spinner = document.querySelector(".spinner");
const infoElements = document.querySelectorAll(".info");
const separators = document.querySelectorAll(".sep");

// Map setup
const map = L.map("mapid");

L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 18,
  }
).addTo(map);

map.zoomControl.setPosition("bottomleft");

const markerSvg =
  "<svg xmlns='http://www.w3.org/2000/svg' width='46' height='56'><path fill-rule='evenodd' d='M39.263 7.673c8.897 8.812 8.966 23.168.153 32.065l-.153.153L23 56 6.737 39.89C-2.16 31.079-2.23 16.723 6.584 7.826l.153-.152c9.007-8.922 23.52-8.922 32.526 0zM23 14.435c-5.211 0-9.436 4.185-9.436 9.347S17.79 33.128 23 33.128s9.436-4.184 9.436-9.346S28.21 14.435 23 14.435z'/></svg>";
const markerIconUrl = encodeURI("data:image/svg+xml," + markerSvg).replace(
  "#",
  "%23"
);
const markerIcon = L.icon({ iconUrl: markerIconUrl });
const marker = L.marker([0, 0], { icon: markerIcon }).addTo(map);

// Reset all info fields to placeholder
function resetFields() {
  ipOutput.textContent = "-";
  locationOutput.textContent = "-";
  timezoneOutput.textContent = "-";
  ispOutput.textContent = "-";
}

// Update map view and marker position
function updateMap(lat, lng) {
  map.setView([lat, lng], 13);
  marker.setLatLng([lat, lng]);
}

// Populate info fields from API data
function displayInfo(data) {
  ipOutput.textContent = data.ip;
  locationOutput.textContent = `${data.city}, ${data.country_name} ${data.zipcode}`;
  timezoneOutput.textContent = `UTC ${data.time_zone.name}`;
  ispOutput.textContent = data.organization;

  ipInput.classList.remove("error");
  errorMessage.classList.remove("show");
}

// Show error message
function showError(message) {
  ipInput.classList.add("error");
  errorMessage.textContent = message;
  errorMessage.classList.add("show");
}

// Toggle spinner and info visibility
function setLoading(isLoading) {
  spinner.classList.toggle("show", isLoading);
  spinner.classList.toggle("hide", !isLoading);
  infoElements.forEach((el) => {
    el.classList.toggle("show", !isLoading);
    el.classList.toggle("hide", isLoading);
  });
  separators.forEach((el) => {
    el.classList.toggle("show", !isLoading);
    el.classList.toggle("hide", isLoading);
  });
}

// Fetch the user's public IP address
async function getUserIp() {
  const response = await fetch("https://api.ipify.org?format=json");
  const data = await response.json();
  return data.ip;
}

// Fetch geolocation info for an IP address
const IP_REGEX = /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
const API_KEY = import.meta.env.VITE_IPGEO_API_KEY;

async function getGeoInfo(query) {
  const response = await fetch(
    `https://api.ipgeolocation.io/ipgeo?apiKey=${API_KEY}&ip=${encodeURIComponent(query)}`,
    { mode: "cors" }
  );

  if (!response.ok) {
    throw new Error("Not a valid IP address or domain");
  }

  return response.json();
}

// Search and display results for a given query
async function search(query) {
  setLoading(true);
  try {
    const data = await getGeoInfo(query);
    displayInfo(data);
    updateMap(data.latitude, data.longitude);
  } catch {
    resetFields();
    showError("Not a valid IP address or domain");
  } finally {
    setLoading(false);
  }
}

// Debounce form submissions
let searchTimeout;
form.addEventListener("submit", (e) => {
  e.preventDefault();
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    const query = ipInput.value.trim();
    if (query) search(query);
  }, 300);
});

// Load user's IP on startup
getUserIp()
  .then((ip) => search(ip))
  .catch(() => {
    setLoading(false);
    showError("Could not detect your IP address");
  });
