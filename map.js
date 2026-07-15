/* ================= REAL MAP INTEGRATION (Leaflet + OpenStreetMap) ================= */
/* Fixed version — map works correctly with Leaflet 1.9.4 */

// City coordinates — admin cities will use default coords
const CITY_COORDS = {
    "Toshkent": [41.2995, 69.2401],
    "Samarqand": [39.6270, 66.9749],
    "Buxoro": [39.7682, 64.4219],
    "Xiva": [41.3785, 60.3639],
    "Namangan": [41.0011, 71.6726],
    "Farg'ona": [40.3864, 71.7864],
    "Andijon": [40.7833, 72.3333],
    "Nukus": [42.4667, 59.6000],
    "Shahrisabz": [39.0500, 66.8333],
    "Termiz": [37.2242, 67.2783],
    "Jizzax": [40.1000, 67.8333],
    "Guliston": [40.4833, 68.7833]
};

// Store maps by container ID for multi-map support
const mapInstances = {};

/* Initialize a map in the given container element */
function initMap(containerId, center, zoom = 13) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.warn('Map container not found:', containerId);
        return null;
    }
    
    // Destroy previous map in this container if it exists
    if (mapInstances[containerId]) {
        try { mapInstances[containerId].remove(); } catch(e) {}
        delete mapInstances[containerId];
    }
    
    // Ensure container has proper dimensions
    container.style.height = '300px';
    container.style.width = '100%';
    container.style.borderRadius = '14px';
    container.style.overflow = 'hidden';
    
    // Make sure container is visible before initializing map
    const isHidden = container.offsetParent === null;
    
    const map = L.map(container, {
        center: center,
        zoom: zoom,
        zoomControl: true,
        attributionControl: true,
        fadeAnimation: true,
        zoomAnimation: true
    });
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
    }).addTo(map);
    
    // Fix map rendering — invalidate size at multiple intervals for reliability
    [100, 400, 800, 1500].forEach(delay => {
        setTimeout(() => { 
            try { map.invalidateSize(true); } catch(e) {} 
        }, delay);
    });
    
    // If container is hidden when initialized, fix it when it becomes visible
    if (isHidden) {
        const observer = new MutationObserver(function() {
            if (container.offsetParent !== null) {
                setTimeout(() => { 
                    try { 
                        map.invalidateSize(true); 
                        if (map.getZoom) map.setZoom(map.getZoom());
                    } catch(e) {}
                }, 300);
                observer.disconnect();
            }
        });
        try {
            observer.observe(container.closest('.screen') || document.body, { 
                attributes: true, attributeFilter: ['class', 'style'] 
            });
        } catch(e) {}
    }
    
    mapInstances[containerId] = map;
    
    return map;
}

/* Add a marker to the map with custom style */
function addMapMarker(map, coords, title, popupText) {
    if (!map || !coords) return null;
    
    const markerIcon = L.divIcon({
        html: `<div style="background:var(--green,#1f6d4c);color:#fff;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid #fff;"><i class='fa-solid fa-location-dot"></i></div>`,
        className: '',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
    });
    
    const marker = L.marker(coords, { icon: markerIcon }).addTo(map);
    if (popupText) {
        marker.bindPopup(`<div style="font-family:Inter,sans-serif;font-size:13px;"><b>${title || ''}</b>${popupText ? '<br>' + popupText : ''}</div>`);
    } else if (title) {
        marker.bindPopup(`<div style="font-family:Inter,sans-serif;font-size:13px;"><b>${title}</b></div>`);
    }
    return marker;
}

/* Show a city on the map with its stops */
function showCityMap(city, stops) {
    const mapContainer = document.getElementById('mapView');
    if (!mapContainer) {
        console.warn('mapView container not found');
        return;
    }
    
    mapContainer.style.display = 'block';
    mapContainer.innerHTML = '<div id="cityMapInner" style="height:300px;border-radius:14px;overflow:hidden;"></div>';
    
    const coords = CITY_COORDS[city] || findCityCoords(city) || [41.2995, 69.2401];
    const map = initMap('cityMapInner', coords, 12);
    if (!map) return;
    
    // Add city marker
    addMapMarker(map, coords, city, `${city} shahri`);
    
    // Add stop markers if available
    if (stops && stops.length > 0) {
        stops.forEach((stop, i) => {
            let stopCoords;
            if (stop.lat && stop.lng) {
                stopCoords = [stop.lat, stop.lng];
            } else {
                // Spread markers around city center in a circle pattern
                const angle = (i / Math.max(stops.length, 1)) * Math.PI * 2;
                const radius = 0.015 + (i % 3) * 0.008;
                const offsetLat = Math.cos(angle) * radius;
                const offsetLng = Math.sin(angle) * radius;
                stopCoords = [coords[0] + offsetLat, coords[1] + offsetLng];
            }
            const popup = `${stop.desc || ''}${stop.time ? '<br><i class="fa-solid fa-clock"></i> ' + stop.time : ''}${stop.dur ? ' · ' + stop.dur + ' daq' : ''}`;
            addMapMarker(map, stopCoords, stop.name, popup);
        });
    }
}

/* Try to find city coordinates from available data */
function findCityCoords(cityName) {
    if (!cityName) return null;
    if (CITY_COORDS[cityName]) return CITY_COORDS[cityName];
    if (typeof adminPlaces !== 'undefined' && adminPlaces) {
        const place = adminPlaces.find(p => p.city === cityName && p.lat && p.lng);
        if (place) return [place.lat, place.lng];
    }
    return null;
}

/* Open a real map in a new tab for a specific location */
function openRealMap(city, placeName) {
    const coords = CITY_COORDS[city];
    if (coords) {
        const query = placeName ? encodeURIComponent(placeName + ', ' + city + ', Uzbekistan') : encodeURIComponent(city + ', Uzbekistan');
        window.open(`https://www.openstreetmap.org/search?query=${query}`, '_blank');
    } else {
        const query = encodeURIComponent((placeName || city || '') + ', Uzbekistan');
        window.open(`https://www.openstreetmap.org/search?query=${query}`, '_blank');
    }
}

/* Show map for the currently active trip (called from itinerary) */
function showCurrentTripMap() {
    if (typeof state === 'undefined' || !state || !state.activeTripId) {
        console.warn('No active trip to show map for');
        return;
    }
    const trip = state.trips.find(t => t.id === state.activeTripId);
    if (!trip) {
        console.warn('Trip not found:', state.activeTripId);
        return;
    }
    showCityMap(trip.city, trip.stops);
}

/* Fix all map sizes — call when navigating */
function fixAllMapSizes() {
    Object.keys(mapInstances).forEach(id => {
        try { mapInstances[id].invalidateSize(true); } catch(e) {}
    });
}

// Auto-fix map sizes on window resize
window.addEventListener('resize', function() {
    setTimeout(fixAllMapSizes, 200);
});

// Fix map sizes when switching tabs or views
document.addEventListener('click', function(e) {
    const navBtn = e.target.closest('.bottom-nav button, .tabs2 button');
    if (navBtn) {
        setTimeout(fixAllMapSizes, 500);
    }
});
