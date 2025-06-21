// Enhanced Geolocation Utility
// GPS and AGPS positioning with screenshot-based static maps
// Focuses on real GPS and AGPS only (no low accuracy/cached positioning)

/**
 * Location accuracy levels - GPS and AGPS only
 */
export const LOCATION_ACCURACY = {
  GPS: 'gps',        // Real GPS satellites (high accuracy)
  AGPS: 'agps',      // Assisted GPS (network + GPS)
  BOTH: 'both'       // Get both GPS and AGPS
};

/**
 * Location error types
 */
export const LOCATION_ERRORS = {
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3,
  NOT_SUPPORTED: 4
};

/**
 * Detect if device has real GPS capability
 */
function detectGpsCapability() {
  // Check if we're on mobile device with GPS
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.screen.width <= 768;
  
  return isMobile || (hasTouch && isSmallScreen);
}

/**
 * Determine actual positioning source based on device and accuracy
 */
function getActualSource(coords, enableHighAccuracy, deviceHasGps) {
  const accuracy = coords.accuracy;
  
  if (!deviceHasGps) {
    // Desktop/PC - no real GPS, only WiFi/IP
    if (accuracy < 100) {
      return 'WiFi Positioning';
    } else if (accuracy < 5000) {
      return 'IP Geolocation';
    } else {
      return 'Network Positioning';
    }
  }
  
  // Mobile device with GPS capability
  if (enableHighAccuracy) {
    if (accuracy < 5) {
      return 'GPS Satellites (High Precision)';
    } else if (accuracy < 20) {
      return 'GPS Satellites';
    } else if (accuracy < 100) {
      return 'Assisted GPS (A-GPS)';
    } else {
      return 'Network/WiFi Positioning';
    }
  } else {
    // AGPS mode
    if (accuracy < 50) {
      return 'Assisted GPS (A-GPS)';
    } else if (accuracy < 200) {
      return 'WiFi/Cell Positioning';
    } else {
      return 'Network Positioning';
    }
  }
}

/**
 * Get device location with GPS and AGPS positioning
 * @param {Object} options - Location options
 * @param {string} options.accuracy - LOCATION_ACCURACY level
 * @param {number} options.timeout - Timeout in milliseconds
 * @param {number} options.maximumAge - Maximum age of cached position
 * @returns {Promise<Object>} Location object with coordinates and metadata
 */
export async function getLocation(options = {}) {
  const {
    accuracy = LOCATION_ACCURACY.BOTH,
    timeout = 20000,
    maximumAge = 30000 // 30 seconds for fresh GPS data
  } = options;

  // Check if geolocation is supported
  if (!navigator.geolocation) {
    throw {
      code: LOCATION_ERRORS.NOT_SUPPORTED,
      message: 'Geolocation is not supported by this browser'
    };
  }

  const deviceHasGps = detectGpsCapability();
  console.log('🔍 Device GPS capability:', deviceHasGps ? 'GPS Capable Device' : 'WiFi/IP Only');

  if (accuracy === LOCATION_ACCURACY.BOTH) {
    // Get both GPS and AGPS positioning
    return await getBothGpsAndAgps(timeout, maximumAge, deviceHasGps);
  }

  // Single positioning method
  const geoOptions = {
    timeout,
    maximumAge,
    enableHighAccuracy: accuracy === LOCATION_ACCURACY.GPS
  };

  return new Promise((resolve, reject) => {
    const methodName = accuracy === LOCATION_ACCURACY.GPS ? 'GPS' : 'AGPS';
    console.log(`🛰️ Getting location with ${methodName} positioning...`);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const actualSource = getActualSource(position.coords, geoOptions.enableHighAccuracy, deviceHasGps);
        
        const result = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
          method: methodName,
          source: actualSource,
          deviceHasGps: deviceHasGps
        };
        
        console.log(`✅ ${methodName} location obtained (${Math.round(position.coords.accuracy)}m):`, result);
        resolve(result);
      },
      (error) => {
        console.error(`❌ ${methodName} location error:`, error);
        reject({
          code: error.code,
          message: getLocationErrorMessage(error.code),
          method: methodName
        });
      },
      geoOptions
    );
  });
}

/**
 * Get both GPS and AGPS positioning simultaneously
 */
async function getBothGpsAndAgps(timeout, maximumAge, deviceHasGps) {
  console.log('🛰️ Getting both GPS and AGPS positioning simultaneously...');
  
  const gpsPromise = new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const actualSource = getActualSource(position.coords, true, deviceHasGps);
        
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
          method: 'GPS',
          source: actualSource,
          deviceHasGps: deviceHasGps
        });
      },
      (error) => reject({ ...error, method: 'GPS' }),
      { enableHighAccuracy: true, timeout, maximumAge }
    );
  });

  const agpsPromise = new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const actualSource = getActualSource(position.coords, false, deviceHasGps);
        
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
          method: 'AGPS',
          source: actualSource,
          deviceHasGps: deviceHasGps
        });
      },
      (error) => reject({ ...error, method: 'AGPS' }),
      { enableHighAccuracy: false, timeout: timeout / 2, maximumAge }
    );
  });

  try {
    // Wait for both to complete
    const results = await Promise.allSettled([gpsPromise, agpsPromise]);
    
    const gpsResult = results[0].status === 'fulfilled' ? results[0].value : null;
    const agpsResult = results[1].status === 'fulfilled' ? results[1].value : null;
    
    if (!gpsResult && !agpsResult) {
      throw {
        code: LOCATION_ERRORS.POSITION_UNAVAILABLE,
        message: 'Both GPS and AGPS positioning failed'
      };
    }

    console.log('✅ GPS Result:', gpsResult);
    console.log('✅ AGPS Result:', agpsResult);

    const result = {
      timestamp: Date.now(),
      method: 'BOTH',
      deviceHasGps: deviceHasGps,
      primary: gpsResult || agpsResult // Use GPS as primary if available
    };

    // Add results
    if (gpsResult) {
      result.gps = gpsResult;
    }
    if (agpsResult) {
      result.agps = agpsResult;
    }

    return result;

  } catch (error) {
    console.error('❌ GPS/AGPS positioning error:', error);
    throw {
      code: error.code || LOCATION_ERRORS.POSITION_UNAVAILABLE,
      message: error.message || 'Failed to get GPS/AGPS location'
    };
  }
}

/**
 * Get human-readable error message for location errors
 */
function getLocationErrorMessage(code) {
  switch (code) {
    case LOCATION_ERRORS.PERMISSION_DENIED:
      return 'Location access denied by user';
    case LOCATION_ERRORS.POSITION_UNAVAILABLE:
      return 'Location information unavailable';
    case LOCATION_ERRORS.TIMEOUT:
      return 'Location request timed out';
    default:
      return 'Unknown location error';
  }
}

/**
 * Convert coordinates to address using reverse geocoding
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {string} provider - Geocoding provider ('osm', 'nominatim')
 * @returns {Promise<Object>} Address information
 */
export async function coordinatesToAddress(latitude, longitude, provider = 'osm') {
  console.log(`🗺️ Converting coordinates to address: ${latitude}, ${longitude}`);
  
  try {
    let url;
    
    switch (provider) {
      case 'osm':
      case 'nominatim':
        // OpenStreetMap Nominatim (free, no API key required)
        url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
        break;
      default:
        throw new Error(`Unsupported geocoding provider: ${provider}`);
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'IamHereApp/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || data.error) {
      throw new Error(data?.error || 'No address found for coordinates');
    }

    // Parse OpenStreetMap response
    const address = {
      formattedAddress: data.display_name,
      street: data.address?.road || data.address?.pedestrian || '',
      houseNumber: data.address?.house_number || '',
      city: data.address?.city || data.address?.town || data.address?.village || '',
      state: data.address?.state || data.address?.region || '',
      country: data.address?.country || '',
      countryCode: data.address?.country_code || '',
      postalCode: data.address?.postcode || '',
      neighborhood: data.address?.neighbourhood || data.address?.suburb || '',
      coordinates: {
        latitude: parseFloat(data.lat),
        longitude: parseFloat(data.lon)
      },
      provider: 'OpenStreetMap'
    };

    console.log('✅ Address obtained:', address);
    return address;

  } catch (error) {
    console.error('❌ Geocoding error:', error);
    throw {
      message: `Failed to convert coordinates to address: ${error.message}`,
      coordinates: { latitude, longitude }
    };
  }
}

/**
 * Convert address to coordinates using forward geocoding
 * @param {string} address - Address string to geocode
 * @param {string} provider - Geocoding provider
 * @returns {Promise<Object>} Coordinates and metadata
 */
export async function addressToCoordinates(address, provider = 'osm') {
  console.log(`🔍 Converting address to coordinates: ${address}`);
  
  try {
    let url;
    
    switch (provider) {
      case 'osm':
      case 'nominatim':
        url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`;
        break;
      default:
        throw new Error(`Unsupported geocoding provider: ${provider}`);
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'IamHereApp/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('No coordinates found for address');
    }

    const result = data[0];
    
    const coordinates = {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      formattedAddress: result.display_name,
      boundingBox: result.boundingbox ? {
        north: parseFloat(result.boundingbox[1]),
        south: parseFloat(result.boundingbox[0]),
        east: parseFloat(result.boundingbox[3]),
        west: parseFloat(result.boundingbox[2])
      } : null,
      provider: 'OpenStreetMap'
    };

    console.log('✅ Coordinates obtained:', coordinates);
    return coordinates;

  } catch (error) {
    console.error('❌ Forward geocoding error:', error);
    throw {
      message: `Failed to convert address to coordinates: ${error.message}`,
      address
    };
  }
}

/**
 * Get current location with address (supports GPS/AGPS)
 * @param {Object} options - Combined location and geocoding options
 * @returns {Promise<Object>} Location with coordinates and address
 */
export async function getCurrentLocationWithAddress(options = {}) {
  try {
    console.log('📍 Getting current location with address...');
    
    // Get coordinates (GPS/AGPS)
    const location = await getLocation(options);
    
    // For dual positioning, get address for primary location
    const primaryLocation = location.primary || location;
    
    // Convert to address
    const address = await coordinatesToAddress(
      primaryLocation.latitude, 
      primaryLocation.longitude, 
      options.provider
    );
    
    return {
      ...location,
      address
    };
    
  } catch (error) {
    console.error('❌ Failed to get location with address:', error);
    throw error;
  }
}

/**
 * Generate Google Maps link for coordinates
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {number} zoom - Zoom level (1-20)
 * @returns {string} Google Maps URL
 */
export function generateGoogleMapsLink(latitude, longitude, zoom = 15) {
  return `https://www.google.com/maps?q=${latitude},${longitude}&z=${zoom}`;
}

/**
 * Generate multiple map service links
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @returns {Object} Map service URLs
 */
export function generateMapLinks(latitude, longitude) {
  return {
    googleMaps: `https://www.google.com/maps?q=${latitude},${longitude}&z=15`,
    openStreetMap: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=15`,
    appleMaps: `https://maps.apple.com/?q=${latitude},${longitude}&z=15`,
    waze: `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`,
    bingMaps: `https://www.bing.com/maps?cp=${latitude}~${longitude}&lvl=15`
  };
}

/**
 * Create screenshot-based static map using HTML5 Canvas and OpenStreetMap tiles
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} language - Map language ('en' for English, 'he' for Hebrew)
 * @returns {Promise<string>} Base64 data URL of the map image
 */
export async function createStaticMapScreenshot(latitude, longitude, zoom = 15, width = 600, height = 400, language = 'en') {
  return new Promise((resolve, reject) => {
    try {
      console.log(`📸 Creating ${language} map screenshot...`);
      
      // Create canvas
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      // Calculate tile coordinates
      const tileSize = 256;
      const scale = Math.pow(2, zoom);
      const worldX = (longitude + 180) / 360 * scale;
      const worldY = (1 - Math.log(Math.tan(latitude * Math.PI / 180) + 1 / Math.cos(latitude * Math.PI / 180)) / Math.PI) / 2 * scale;
      
      // Calculate center tile
      const centerTileX = Math.floor(worldX);
      const centerTileY = Math.floor(worldY);
      
      // Calculate offset within tile
      const offsetX = (worldX - centerTileX) * tileSize;
      const offsetY = (worldY - centerTileY) * tileSize;
      
      // Calculate how many tiles we need
      const tilesX = Math.ceil(width / tileSize) + 1;
      const tilesY = Math.ceil(height / tileSize) + 1;
      
      // Starting tile position
      const startTileX = centerTileX - Math.floor(tilesX / 2);
      const startTileY = centerTileY - Math.floor(tilesY / 2);
      
      let loadedTiles = 0;
      const totalTiles = tilesX * tilesY;
      
      // Load and draw tiles
      for (let x = 0; x < tilesX; x++) {
        for (let y = 0; y < tilesY; y++) {
          const tileX = startTileX + x;
          const tileY = startTileY + y;
          
          // Skip invalid tiles
          if (tileX < 0 || tileY < 0 || tileX >= scale || tileY >= scale) {
            loadedTiles++;
            if (loadedTiles === totalTiles) {
              addPinAndFinish();
            }
            continue;
          }
          
          const img = new Image();
          img.crossOrigin = 'anonymous';
          
          img.onload = function() {
            // Calculate position on canvas
            const canvasX = x * tileSize - offsetX + width / 2 - tileSize / 2;
            const canvasY = y * tileSize - offsetY + height / 2 - tileSize / 2;
            
            ctx.drawImage(img, canvasX, canvasY);
            
            loadedTiles++;
            if (loadedTiles === totalTiles) {
              addPinAndFinish();
            }
          };
          
          img.onerror = function() {
            console.warn(`Failed to load tile: ${tileX}/${tileY}/${zoom}`);
            loadedTiles++;
            if (loadedTiles === totalTiles) {
              addPinAndFinish();
            }
          };
          
          // Use OpenStreetMap tile server
          img.src = `https://tile.openstreetmap.org/${zoom}/${tileX}/${tileY}.png`;
        }
      }
      
      function addPinAndFinish() {
        // Add location pin
        const pinX = width / 2;
        const pinY = height / 2;
        
        // Draw pin shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(pinX + 2, pinY + 25, 8, 4, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw pin
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(pinX, pinY - 10, 12, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(pinX, pinY - 10, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw pin needle
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.moveTo(pinX, pinY - 2);
        ctx.lineTo(pinX - 3, pinY + 15);
        ctx.lineTo(pinX + 3, pinY + 15);
        ctx.closePath();
        ctx.fill();
        
        // Add coordinates text with language support
        const coordText = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        const zoomText = language === 'he' ? `תקריב: ${zoom}` : `Zoom: ${zoom}`;
        const langLabel = language === 'he' ? 'עברית' : 'English';
        
        // Background for text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillRect(10, height - 50, 250, 40);
        
        // Coordinates
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(coordText, 15, height - 33);
        
        // Zoom level and language
        ctx.font = '11px Arial';
        ctx.fillText(`${zoomText} | ${langLabel}`, 15, height - 18);
        
        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        console.log(`✅ ${language} map screenshot created`);
        resolve(dataUrl);
      }
      
      // Timeout fallback
      setTimeout(() => {
        if (loadedTiles < totalTiles) {
          console.warn('Map screenshot timeout, using partial result');
          addPinAndFinish();
        }
      }, 10000);
      
    } catch (error) {
      console.error('❌ Failed to create map screenshot:', error);
      reject(error);
    }
  });
}

/**
 * Try to get static map with screenshot fallback
 * @param {number} latitude - Latitude coordinate
 * @param {number} longitude - Longitude coordinate
 * @param {number} zoom - Zoom level
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @param {string} language - Map language
 * @returns {Promise<string>} Map image URL or data URL
 */
export async function getWorkingStaticMapUrl(latitude, longitude, zoom = 15, width = 600, height = 400, language = 'en') {
  try {
    console.log(`🗺️ Creating custom ${language} map screenshot...`);
    
    // Use screenshot method directly (more reliable than external APIs)
    const screenshotUrl = await createStaticMapScreenshot(latitude, longitude, zoom, width, height, language);
    return screenshotUrl;
    
  } catch (error) {
    console.error('❌ Failed to create map screenshot:', error);
    return null;
  }
}

/**
 * Watch position changes (for real-time tracking)
 * @param {Function} callback - Called with each position update
 * @param {Object} options - Watch options
 * @returns {number} Watch ID for clearing the watch
 */
export function watchLocation(callback, options = {}) {
  const {
    accuracy = LOCATION_ACCURACY.GPS,
    timeout = 15000,
    maximumAge = 30000 // 30 seconds for real-time GPS tracking
  } = options;

  if (!navigator.geolocation) {
    throw new Error('Geolocation is not supported');
  }

  const deviceHasGps = detectGpsCapability();
  const geoOptions = {
    enableHighAccuracy: accuracy === LOCATION_ACCURACY.GPS,
    timeout,
    maximumAge
  };

  console.log('👁️ Starting GPS location watch...');
  console.log('🛰️ Real-time GPS tracking continuously monitors your position for navigation and fitness tracking.');
  
  return navigator.geolocation.watchPosition(
    (position) => {
      const actualSource = getActualSource(position.coords, geoOptions.enableHighAccuracy, deviceHasGps);
      
      const result = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
        method: accuracy.toUpperCase(),
        source: actualSource,
        deviceHasGps: deviceHasGps
      };
      
      console.log(`👁️ GPS update (${Math.round(position.coords.accuracy)}m):`, result);
      callback(result);
    },
    (error) => {
      callback(null, {
        code: error.code,
        message: getLocationErrorMessage(error.code)
      });
    },
    geoOptions
  );
}

/**
 * Stop watching location
 * @param {number} watchId - Watch ID returned by watchLocation
 */
export function stopWatchingLocation(watchId) {
  if (navigator.geolocation && watchId) {
    navigator.geolocation.clearWatch(watchId);
    console.log('🛑 Stopped GPS location watch');
  }
}
