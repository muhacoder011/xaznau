/* ================= REAL MAP INTEGRATION (Leaflet + OpenStreetMap) ================= */

// City coordinates (latitude, longitude)
const CITY_COORDS = {
    "Toshkent": [41.2995, 69.2401],
    "Samarqand": [39.6270, 66.9749],
    "Buxoro": [39.7682, 64.4219],
    "Xiva": [41.3785, 60.3639],
    "Namangan": [41.0011, 71.6726],
    "Farg'ona": [40.3864, 71.7864]
};

// Place coordinates for specific locations (can be expanded)
const PLACE_COORDS = {};

let activeMap = null;
let activeMapContainer = null;

/* Initialize a map in the given container element */
function initMap(containerId, center, zoom = 13) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    
    // Destroy previous map in this container
    if (activeMap && activeMapContainer === containerId) {
        activeMap.remove();
        activeMap = null;
    }
    
    // Ensure container has size
    container.style.height = '300px';
    container.style.width = '100%';
    container.style.borderRadius = '14px';
    
    const map = L.map(container, {
        center: center,
        zoom: zoom,
        zoomControl: true,
        attributionControl: true
    });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Fix map rendering after container becomes visible
    setTimeout(() => map.invalidateSize(), 300);
    
    activeMap = map;
    activeMapContainer = containerId;
    
    return map;
}

/* Add a marker to the map */
function addMapMarker(map, coords, title, popupText) {
    if (!map || !coords) return;
    const marker = L.marker(coords).addTo(map);
    if (popupText) {
        marker.bindPopup(`<b>${title}</b><br>${popupText}`);
    } else if (title) {
        marker.bindPopup(`<b>${title}</b>`);
    }
    return marker;
}

/* Show a city on the map with its stops */
function showCityMap(city, stops) {
    const mapContainer = document.getElementById('mapView');
    if (!mapContainer) return;
    
    mapContainer.style.display = 'block';
    mapContainer.innerHTML = '<div id="cityMapInner" style="height:300px;border-radius:14px;"></div>';
    
    const coords = CITY_COORDS[city] || [41.2995, 69.2401]; // default to Tashkent
    const map = initMap('cityMapInner', coords, 12);
    if (!map) return;
    
    // Add city marker
    addMapMarker(map, coords, city, `${city} shahri`);
    
    // Add stop markers if available
    if (stops && stops.length > 0) {
        stops.forEach((stop, i) => {
            // For default cities, place stops around the city center with slight offsets
            const offsetLat = (Math.random() - 0.5) * 0.05;
            const offsetLng = (Math.random() - 0.5) * 0.05;
            const stopCoords = [coords[0] + offsetLat, coords[1] + offsetLng];
            addMapMarker(map, stopCoords, stop.name, `${stop.desc || ''}<br>🕐 ${stop.time} · ${stop.dur} daq`);
        });
    }
}

/* Open a real map in a new tab for a specific location */
function openRealMap(city, placeName) {
    const coords = CITY_COORDS[city];
    if (coords) {
        const query = placeName ? encodeURIComponent(placeName + ', ' + city + ', Uzbekistan') : encodeURIComponent(city + ', Uzbekistan');
        window.open(`https://www.openstreetmap.org/search?query=${query}`, '_blank');
    } else {
        const query = encodeURIComponent((placeName || city) + ', Uzbekistan');
        window.open(`https://www.openstreetmap.org/search?query=${query}`, '_blank');
    }
}

/* Show map for the currently active trip (called from itinerary) */
function showCurrentTripMap() {
    if (!state || !state.activeTripId) return;
    const trip = state.trips.find(t => t.id === state.activeTripId);
    if (!trip) return;
    showCityMap(trip.city, trip.stops);
}
