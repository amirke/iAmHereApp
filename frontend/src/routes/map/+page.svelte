<script>
  // Enhanced Map Page - GPS and AGPS Positioning with Screenshot Maps
  // Gets both GPS and AGPS positioning automatically (no user choice needed)
  
  import { onMount, onDestroy } from 'svelte';
  import { browser } from '$app/environment';
  import { t, isLoading } from 'svelte-i18n';
  import { 
    getLocation, 
    getCurrentLocationWithAddress,
    coordinatesToAddress,
    addressToCoordinates,
    watchLocation,
    stopWatchingLocation,
    generateMapLinks,
    getWorkingStaticMapUrl,
    LOCATION_ACCURACY,
    LOCATION_ERRORS
  } from '$lib/utils/geolocation.js';

  // State variables
  let bestLocation = null;
  let currentAddress = null;
  let isGettingLocation = false;
  let isWatchingLocation = false;
  let watchId = null;
  let error = null;
  let searchAddress = '';
  let searchResults = null;
  let isSearching = false;
  let locationHistory = [];
  let mapLinks = null;
  let staticMapUrlEn = null;
  let staticMapUrlHe = null;
  let isLoadingMapEn = false;
  let isLoadingMapHe = false;
  let mapZoomEn = 15;
  let mapZoomHe = 15;
  let enlargedImage = null;
  let enlargedImageTitle = '';

  onMount(() => {
    console.log('🛰️ GPS/AGPS Map page loaded');
    clearMapCache();
  });

  onDestroy(() => {
    if (watchId) {
      stopWatchingLocation(watchId);
    }
  });

  /**
   * Clear all cached map data for fresh results
   */
  function clearMapCache() {
    console.log('🧹 Clearing map cache...');
    bestLocation = null;
    currentAddress = null;
    staticMapUrlEn = null;
    staticMapUrlHe = null;
    mapLinks = null;
    locationHistory = [];
    error = null;
    console.log('✅ Map cache cleared');
  }

  /**
   * Get current location with GPS and AGPS positioning
   */
  async function getCurrentLocation() {
    if (!browser) return;
    
    // Clear cache before getting new location
    clearMapCache();
    
    isGettingLocation = true;
    error = null;
    
    try {
      console.log('🛰️ Getting GPS and AGPS positioning...');
      
      const location = await getCurrentLocationWithAddress({
        accuracy: LOCATION_ACCURACY.BOTH,
        timeout: 25000 // Longer timeout for GPS acquisition
      });
      
      // Select the best location from GPS/AGPS results
      bestLocation = selectBestLocation(location);
      currentAddress = location.address;
      
      // Generate map links for best location
      mapLinks = generateMapLinks(bestLocation.latitude, bestLocation.longitude);
      
      // Create screenshot-based static maps in both languages
      await loadStaticMaps(bestLocation.latitude, bestLocation.longitude);
      
      // Add to history
      locationHistory = [
        {
          timestamp: new Date().toLocaleString(),
          location: bestLocation,
          method: bestLocation.method || 'GPS/AGPS'
        },
        ...locationHistory.slice(0, 4) // Keep last 5 entries
      ];
      
      console.log('✅ Best location selected:', bestLocation);
      console.log('🗺️ Map links generated:', mapLinks);
      
    } catch (err) {
      console.error('❌ GPS/AGPS location error:', err);
      error = err.message || 'Failed to get GPS/AGPS location';
      clearMapCache();
    } finally {
      isGettingLocation = false;
    }
  }

  /**
   * Select the best location from GPS/AGPS results
   */
  function selectBestLocation(locationData) {
    if (!locationData) return null;
    
    // If we have both GPS and AGPS, select the most accurate one
    if (locationData.gps && locationData.agps) {
      const gpsAccuracy = locationData.gps.accuracy || 999999;
      const agpsAccuracy = locationData.agps.accuracy || 999999;
      
      if (gpsAccuracy <= agpsAccuracy) {
        console.log('📡 Selected GPS as best location (accuracy:', gpsAccuracy + 'm)');
        return {
          ...locationData.gps,
          source: 'GPS (Satellite)',
          method: 'GPS',
          selectedReason: `GPS selected - better accuracy (±${Math.round(gpsAccuracy)}m vs ±${Math.round(agpsAccuracy)}m)`
        };
      } else {
        console.log('🔗 Selected AGPS as best location (accuracy:', agpsAccuracy + 'm)');
        return {
          ...locationData.agps,
          source: 'AGPS (Network-Assisted)',
          method: 'AGPS',
          selectedReason: `AGPS selected - better accuracy (±${Math.round(agpsAccuracy)}m vs ±${Math.round(gpsAccuracy)}m)`
        };
      }
    }
    
    // If we only have GPS
    if (locationData.gps) {
      console.log('📡 Using GPS location only');
      return {
        ...locationData.gps,
        source: 'GPS (Satellite)',
        method: 'GPS',
        selectedReason: 'GPS only available'
      };
    }
    
    // If we only have AGPS
    if (locationData.agps) {
      console.log('🔗 Using AGPS location only');
      return {
        ...locationData.agps,
        source: 'AGPS (Network-Assisted)',
        method: 'AGPS',
        selectedReason: 'AGPS only available'
      };
    }
    
    // Fallback to primary or single location
    const fallbackLocation = locationData.primary || locationData;
    console.log('🎯 Using fallback location');
    return {
      ...fallbackLocation,
      selectedReason: 'Fallback location used'
    };
  }

  /**
   * Load static maps in both English and Hebrew
   */
  async function loadStaticMaps(latitude, longitude) {
    // Load both maps in parallel for better performance
    await Promise.all([
      loadStaticMapEn(latitude, longitude, mapZoomEn),
      loadStaticMapHe(latitude, longitude, mapZoomHe)
    ]);
  }

  /**
   * Load English static map
   */
  async function loadStaticMapEn(latitude, longitude, zoom) {
    isLoadingMapEn = true;
    try {
      console.log('📸 Creating English map screenshot...');
      staticMapUrlEn = await getWorkingStaticMapUrl(latitude, longitude, zoom, 600, 400, 'en');
      if (staticMapUrlEn) {
        console.log('✅ English map screenshot created successfully');
      } else {
        console.log('❌ Failed to create English map screenshot');
      }
    } catch (error) {
      console.error('❌ Failed to create English map screenshot:', error);
      staticMapUrlEn = null;
    } finally {
      isLoadingMapEn = false;
    }
  }

  /**
   * Load Hebrew static map
   */
  async function loadStaticMapHe(latitude, longitude, zoom) {
    isLoadingMapHe = true;
    try {
      console.log('📸 Creating Hebrew map screenshot...');
      staticMapUrlHe = await getWorkingStaticMapUrl(latitude, longitude, zoom, 600, 400, 'he');
      if (staticMapUrlHe) {
        console.log('✅ Hebrew map screenshot created successfully');
      } else {
        console.log('❌ Failed to create Hebrew map screenshot');
      }
    } catch (error) {
      console.error('❌ Failed to create Hebrew map screenshot:', error);
      staticMapUrlHe = null;
    } finally {
      isLoadingMapHe = false;
    }
  }

  /**
   * Update English map zoom
   */
  function updateEnglishMapZoom() {
    if (bestLocation) {
      loadStaticMapEn(bestLocation.latitude, bestLocation.longitude, mapZoomEn);
    }
  }

  /**
   * Update Hebrew map zoom
   */
  function updateHebrewMapZoom() {
    if (bestLocation) {
      loadStaticMapHe(bestLocation.latitude, bestLocation.longitude, mapZoomHe);
    }
  }

  /**
   * Enlarge image for detailed viewing
   */
  function enlargeImage(imageUrl, title) {
    enlargedImage = imageUrl;
    enlargedImageTitle = title;
  }

  /**
   * Close enlarged image
   */
  function closeEnlargedImage() {
    enlargedImage = null;
    enlargedImageTitle = '';
  }

  /**
   * Handle keyboard events for accessibility
   */
  function handleImageKeydown(event, imageUrl, title) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      enlargeImage(imageUrl, title);
    }
  }

  /**
   * Handle modal keyboard events
   */
  function handleModalKeydown(event) {
    if (event.key === 'Escape') {
      closeEnlargedImage();
    }
  }

  /**
   * Load static map using screenshot method
   */
  async function loadStaticMap(latitude, longitude) {
    // This function is kept for compatibility but now we use loadStaticMaps
    await loadStaticMaps(latitude, longitude);
  }

  /**
   * Start watching GPS location changes
   */
  function startWatching() {
    if (!browser || isWatchingLocation) return;
    
    try {
      isWatchingLocation = true;
      error = null;
      
      watchId = watchLocation(
        (location, watchError) => {
          if (watchError) {
            console.error('👁️ GPS watch error:', watchError);
            error = watchError.message;
            stopWatching();
            return;
          }
          
          if (location) {
            // Update current location data
            if (bestLocation) {
              bestLocation = { ...bestLocation, ...location };
            } else {
              bestLocation = location;
            }
            
            console.log('👁️ GPS location update:', location);
            
            // Update map links
            mapLinks = generateMapLinks(location.latitude, location.longitude);
            
            // Update static map
            loadStaticMap(location.latitude, location.longitude);
            
            // Get address for new location (if accuracy is good)
            if (location.accuracy < 100) {
              getAddressForLocation(location.latitude, location.longitude);
            }
          }
        },
        {
          accuracy: LOCATION_ACCURACY.GPS, // Use GPS for tracking
          timeout: 10000,
          maximumAge: 30000 // 30 seconds for GPS tracking
        }
      );
      
      console.log('👁️ Started GPS location watching');
      
    } catch (err) {
      console.error('❌ GPS watch error:', err);
      error = err.message;
      isWatchingLocation = false;
    }
  }

  /**
   * Stop watching location
   */
  function stopWatching() {
    if (watchId) {
      stopWatchingLocation(watchId);
      watchId = null;
    }
    isWatchingLocation = false;
    console.log('🛑 Stopped GPS location watching');
  }

  /**
   * Get address for specific coordinates
   */
  async function getAddressForLocation(lat, lng) {
    try {
      const address = await coordinatesToAddress(lat, lng);
      currentAddress = address;
    } catch (err) {
      console.error('❌ Geocoding error:', err);
    }
  }

  /**
   * Search for address and convert to coordinates
   */
  async function searchForAddress() {
    if (!searchAddress.trim()) return;
    
    isSearching = true;
    error = null;
    
    try {
      console.log('🔍 Searching for address:', searchAddress);
      
      const result = await addressToCoordinates(searchAddress);
      searchResults = result;
      
      console.log('✅ Search results:', result);
      
    } catch (err) {
      console.error('❌ Search error:', err);
      error = err.message || 'Address not found';
      searchResults = null;
    } finally {
      isSearching = false;
    }
  }

  /**
   * Use search result as current location
   */
  async function useSearchResult() {
    if (searchResults) {
      bestLocation = {
        primary: {
          latitude: searchResults.latitude,
          longitude: searchResults.longitude,
          accuracy: 0, // Geocoded location
          timestamp: Date.now(),
          method: 'GEOCODED',
          source: 'Address Search',
          deviceHasGps: false
        },
        method: 'GEOCODED',
        deviceHasGps: false
      };
      
      currentAddress = {
        formattedAddress: searchResults.formattedAddress,
        coordinates: {
          latitude: searchResults.latitude,
          longitude: searchResults.longitude
        },
        provider: searchResults.provider
      };
      
      // Generate map links and load static map
      mapLinks = generateMapLinks(searchResults.latitude, searchResults.longitude);
      await loadStaticMap(searchResults.latitude, searchResults.longitude);
      
      searchResults = null;
      searchAddress = '';
    }
  }

  /**
   * Copy coordinates to clipboard
   */
  async function copyCoordinates(location) {
    if (location && navigator.clipboard) {
      const coords = `${location.latitude}, ${location.longitude}`;
      try {
        await navigator.clipboard.writeText(coords);
        console.log('📋 Coordinates copied to clipboard');
        // Could add a toast notification here
      } catch (err) {
        console.error('Failed to copy coordinates:', err);
      }
    }
  }

  /**
   * Get accuracy color for display
   */
  function getAccuracyColor(accuracy) {
    if (!accuracy) return '#666';
    if (accuracy < 5) return '#4CAF50'; // Green - GPS High Precision
    if (accuracy < 20) return '#8BC34A'; // Light Green - GPS
    if (accuracy < 50) return '#FF9800'; // Orange - AGPS Good
    if (accuracy < 200) return '#FF5722'; // Red-orange - AGPS Acceptable
    return '#F44336'; // Red - Poor
  }

  /**
   * Format accuracy for display
   */
  function formatAccuracy(accuracy) {
    if (!accuracy) return 'Unknown';
    if (accuracy < 1000) return `±${Math.round(accuracy)}m`;
    return `±${(accuracy / 1000).toFixed(1)}km`;
  }

  /**
   * Open map service in new tab
   */
  function openMapService(url) {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }

  /**
   * Get device type description
   */
  function getDeviceTypeDescription(deviceHasGps) {
    return deviceHasGps ? 'GPS Capable Device' : 'WiFi/IP Positioning Only';
  }
</script>

{#if !$isLoading}
  <div class="map-container">
    <h1>{$t('GPS & AGPS Location Services')}</h1>
    
    <!-- Location Controls -->
    <div class="controls-section">
      <h2>🛰️ Get GPS & AGPS Location</h2>
      <div class="info-box">
        <h4>🛰️ GPS & AGPS Positioning:</h4>
        <ul>
          <li><strong>📡 GPS:</strong> Real satellite positioning (±3-20m accuracy)</li>
          <li><strong>🔗 AGPS:</strong> Assisted GPS with network data (±20-100m accuracy)</li>
          <li><strong>🎯 Automatic:</strong> Gets both GPS and AGPS simultaneously</li>
          <li><strong>📸 Screenshots:</strong> Creates custom map images (no API failures)</li>
        </ul>
      </div>
      
      <!-- Location Buttons -->
      <div class="button-group">
        <button 
          on:click={getCurrentLocation} 
          disabled={isGettingLocation || isWatchingLocation}
          class="primary large"
        >
          {#if isGettingLocation}
            🛰️ Getting GPS & AGPS Location...
          {:else}
            🛰️ Get GPS & AGPS Location
          {/if}
        </button>
        
        {#if !isWatchingLocation}
          <button 
            on:click={startWatching} 
            disabled={isGettingLocation}
            class="secondary"
            title="Continuously track your GPS position in real-time for navigation and movement monitoring."
          >
            👁️ Start GPS Tracking
          </button>
        {:else}
          <button 
            on:click={stopWatching}
            class="danger"
          >
            🛑 Stop GPS Tracking
          </button>
        {/if}
      </div>
      
      <div class="tracking-info">
        <p><strong>What is GPS Tracking?</strong></p>
        <p>🛰️ Continuously monitors your GPS position for accurate real-time tracking:</p>
        <ul>
          <li>🗺️ <strong>Navigation:</strong> Precise route tracking and turn-by-turn guidance</li>
          <li>🏃 <strong>Fitness:</strong> Accurate distance and speed monitoring</li>
          <li>📍 <strong>Location Sharing:</strong> Real-time position updates</li>
          <li>🚗 <strong>Vehicle Tracking:</strong> Monitor trips and routes</li>
        </ul>
      </div>
    </div>

    <!-- Address Search -->
    <div class="search-section">
      <h2>🔍 Address Search</h2>
      <div class="search-form">
        <input 
          type="text" 
          bind:value={searchAddress}
          placeholder="Enter address to search..."
          disabled={isSearching}
        />
        <button 
          on:click={searchForAddress}
          disabled={isSearching || !searchAddress.trim()}
          class="primary"
        >
          {#if isSearching}
            🔄 Searching...
          {:else}
            🔍 Search
          {/if}
        </button>
      </div>
      
      {#if searchResults}
        <div class="search-results">
          <h3>Search Results:</h3>
          <div class="result-card">
            <p><strong>Address:</strong> {searchResults.formattedAddress}</p>
            <p><strong>Coordinates:</strong> {searchResults.latitude}, {searchResults.longitude}</p>
            <button on:click={useSearchResult} class="primary">
              📍 Use This Location
            </button>
          </div>
        </div>
      {/if}
    </div>

          <!-- Current Location Display -->
      {#if bestLocation}
        <div class="location-display">
          <div class="location-header">
            <h2>🛰️ Best Location Result</h2>
            <button 
              type="button"
              class="clear-cache-btn"
              on:click={clearMapCache}
              title="Clear all cached location and map data"
            >
              🧹 Clear Cache
            </button>
          </div>
          
          <!-- Best Location Card -->
          <div class="best-location-card">
            <h3>📍 Selected Location</h3>
            <div class="coordinates">
              <p class="coords">
                <strong>Lat:</strong> {bestLocation.latitude.toFixed(6)}<br>
                <strong>Lng:</strong> {bestLocation.longitude.toFixed(6)}
              </p>
              <button on:click={() => copyCoordinates(bestLocation)} class="copy-btn">
                📋 Copy Coordinates
              </button>
            </div>
            
            <div class="metadata">
              <p><strong>Method:</strong> {bestLocation.method}</p>
              <p><strong>Source:</strong> {bestLocation.source}</p>
              <p><strong>Accuracy:</strong> 
                <span style="color: {getAccuracyColor(bestLocation.accuracy)}">
                  {formatAccuracy(bestLocation.accuracy)}
                </span>
              </p>
              {#if bestLocation.selectedReason}
                <p><strong>Selection Reason:</strong> {bestLocation.selectedReason}</p>
              {/if}
              {#if bestLocation.altitude}
                <p><strong>Altitude:</strong> {Math.round(bestLocation.altitude)}m</p>
              {/if}
              {#if bestLocation.speed}
                <p><strong>Speed:</strong> {Math.round(bestLocation.speed * 3.6)} km/h</p>
              {/if}
              <p><strong>Time:</strong> {new Date(bestLocation.timestamp).toLocaleString()}</p>
            </div>
          </div>
          
          <!-- Device Type Info -->
          <div class="device-info">
            <p><strong>Device Type:</strong> {getDeviceTypeDescription(bestLocation.deviceHasGps)}</p>
          </div>
        
        <!-- GPS and AGPS Results -->

        
        <!-- Address Information -->
        {#if currentAddress}
          <div class="address-card">
            <h3>📮 Address Information</h3>
            <p class="formatted-address">{currentAddress.formattedAddress}</p>
            
            <div class="address-details">
              {#if currentAddress.street}
                <p><strong>Street:</strong> {currentAddress.houseNumber} {currentAddress.street}</p>
              {/if}
              {#if currentAddress.neighborhood}
                <p><strong>Neighborhood:</strong> {currentAddress.neighborhood}</p>
              {/if}
              {#if currentAddress.city}
                <p><strong>City:</strong> {currentAddress.city}</p>
              {/if}
              {#if currentAddress.state}
                <p><strong>State:</strong> {currentAddress.state}</p>
              {/if}
              {#if currentAddress.country}
                <p><strong>Country:</strong> {currentAddress.country} ({currentAddress.countryCode})</p>
              {/if}
              {#if currentAddress.postalCode}
                <p><strong>Postal Code:</strong> {currentAddress.postalCode}</p>
              {/if}
              <p><strong>Provider:</strong> {currentAddress.provider}</p>
            </div>
          </div>
        {/if}

        <!-- Map Links -->
        {#if mapLinks}
          <div class="map-links-section">
            <h3>🗺️ View Location in Maps</h3>
            <div class="map-links-grid">
              <button on:click={() => openMapService(mapLinks.googleMaps)} class="map-link google">
                🗺️ Google Maps
              </button>
              <button on:click={() => openMapService(mapLinks.openStreetMap)} class="map-link osm">
                🗺️ OpenStreetMap
              </button>
              <button on:click={() => openMapService(mapLinks.appleMaps)} class="map-link apple">
                🍎 Apple Maps
              </button>
              <button on:click={() => openMapService(mapLinks.waze)} class="map-link waze">
                🚗 Waze
              </button>
              <button on:click={() => openMapService(mapLinks.bingMaps)} class="map-link bing">
                🗺️ Bing Maps
              </button>
            </div>
          </div>
        {/if}

        <!-- English Map Section -->
        <div class="static-map-section">
          <h3>🗺️ English Map</h3>
          <div class="map-controls">
            <label for="zoom-en">Zoom Level:</label>
            <input 
              type="range" 
              id="zoom-en"
              bind:value={mapZoomEn} 
              min="10" 
              max="18" 
              step="1"
              on:change={updateEnglishMapZoom}
            >
            <span class="zoom-value">{mapZoomEn}</span>
            <button 
              type="button" 
              class="refresh-btn"
              on:click={updateEnglishMapZoom}
              disabled={isLoadingMapEn}
            >
              🔄 Update
            </button>
          </div>
          
          {#if isLoadingMapEn}
            <div class="map-loading">
              <p>📸 Creating English map screenshot...</p>
              <p class="loading-detail">Building map from OpenStreetMap tiles with location pin</p>
            </div>
          {:else if staticMapUrlEn}
            <div class="map-container-inner">
              <button 
                type="button"
                class="map-image-button"
                on:click={() => enlargeImage(staticMapUrlEn, 'English Map - Zoom Level ' + mapZoomEn)}
                aria-label="Click to enlarge English map"
              >
                <img 
                  src={staticMapUrlEn} 
                  alt="English map showing current location" 
                  class="static-map"
                  on:error={() => {
                    console.error('Failed to load English map screenshot');
                    staticMapUrlEn = null;
                  }}
                />
              </button>
              <p class="map-caption">📸 Click to enlarge • English map with location pin</p>
              <p class="map-tech">Built using OpenStreetMap tiles + HTML5 Canvas</p>
            </div>
          {:else}
            <div class="map-error">
              <p>❌ Failed to create English map screenshot</p>
              <button 
                type="button" 
                class="retry-btn"
                on:click={updateEnglishMapZoom}
              >
                🔄 Retry
              </button>
            </div>
          {/if}
        </div>

        <!-- Hebrew Map Section -->
        <div class="static-map-section">
          <h3>🗺️ Hebrew Map / מפה בעברית</h3>
          <div class="map-controls">
            <label for="zoom-he">Zoom Level / רמת תקריב:</label>
            <input 
              type="range" 
              id="zoom-he"
              bind:value={mapZoomHe} 
              min="10" 
              max="18" 
              step="1"
              on:change={updateHebrewMapZoom}
            >
            <span class="zoom-value">{mapZoomHe}</span>
            <button 
              type="button" 
              class="refresh-btn"
              on:click={updateHebrewMapZoom}
              disabled={isLoadingMapHe}
            >
              🔄 עדכן
            </button>
          </div>
          
          {#if isLoadingMapHe}
            <div class="map-loading">
              <p>📸 יוצר צילום מסך של מפה בעברית...</p>
              <p class="loading-detail">בונה מפה מאריחי OpenStreetMap עם סיכת מיקום</p>
            </div>
          {:else if staticMapUrlHe}
            <div class="map-container-inner">
              <button 
                type="button"
                class="map-image-button"
                on:click={() => enlargeImage(staticMapUrlHe, 'מפה בעברית - רמת תקריב ' + mapZoomHe)}
                aria-label="לחץ להגדיל את המפה בעברית"
              >
                <img 
                  src={staticMapUrlHe} 
                  alt="Hebrew map showing current location" 
                  class="static-map"
                  on:error={() => {
                    console.error('Failed to load Hebrew map screenshot');
                    staticMapUrlHe = null;
                  }}
                />
              </button>
              <p class="map-caption">📸 לחץ להגדלה • מפה בעברית עם סיכת מיקום</p>
              <p class="map-tech">נבנה באמצעות אריחי OpenStreetMap + HTML5 Canvas</p>
            </div>
          {:else}
            <div class="map-error">
              <p>❌ נכשל ביצירת צילום מסך של מפה בעברית</p>
              <button 
                type="button" 
                class="retry-btn"
                on:click={updateHebrewMapZoom}
              >
                🔄 נסה שוב
              </button>
            </div>
          {/if}
        </div>
      </div>
    {/if}

    <!-- Location History -->
    {#if locationHistory.length > 0}
      <div class="history-section">
        <h2>📜 GPS/AGPS Location History</h2>
        {#each locationHistory as entry}
          <div class="history-entry">
            <p><strong>{entry.timestamp}</strong> ({entry.method})</p>
            {#if entry.location.primary}
              <p>{entry.location.primary.latitude.toFixed(6)}, {entry.location.primary.longitude.toFixed(6)}</p>
              <p class="accuracy">Accuracy: {formatAccuracy(entry.location.primary.accuracy)}</p>
            {:else if entry.location.latitude}
              <p>{entry.location.latitude.toFixed(6)}, {entry.location.longitude.toFixed(6)}</p>
              <p class="accuracy">Accuracy: {formatAccuracy(entry.location.accuracy)}</p>
            {/if}
          </div>
        {/each}
      </div>
    {/if}

    <!-- Error Display -->
    {#if error}
      <div class="error-display">
        <h3>❌ Error</h3>
        <p>{error}</p>
        <p class="error-help">
          {#if error.includes('denied')}
            Please allow location access in your browser settings.
          {:else if error.includes('unavailable')}
            GPS/AGPS services might be disabled or signal is weak.
          {:else if error.includes('timeout')}
            GPS acquisition timed out. Try moving to an area with better signal.
          {/if}
        </p>
      </div>
    {/if}

    <!-- Technical Information -->
    <div class="tech-info">
      <h2>🔧 GPS & AGPS Technology</h2>
      
      <div class="info-grid">
        <div class="info-card">
          <h3>🛰️ GPS vs AGPS</h3>
          <ul>
            <li><strong>GPS:</strong> Real satellite positioning (±3-20m)</li>
            <li><strong>AGPS:</strong> Network-assisted GPS (±20-100m)</li>
            <li><strong>Speed:</strong> AGPS faster, GPS more accurate</li>
            <li><strong>Both:</strong> Get comprehensive location data</li>
          </ul>
        </div>
        
        <div class="info-card">
          <h3>📸 Screenshot Maps</h3>
          <ul>
            <li><strong>Custom Built:</strong> No external API dependencies</li>
            <li><strong>OpenStreetMap:</strong> Uses free tile services</li>
            <li><strong>HTML5 Canvas:</strong> Renders maps with location pins</li>
            <li><strong>Always Works:</strong> No 403 Forbidden errors</li>
          </ul>
        </div>
        
        <div class="info-card">
          <h3>🗺️ Map Services</h3>
          <ul>
            <li><strong>Google Maps:</strong> Direct links for both GPS & AGPS</li>
            <li><strong>Multiple Services:</strong> Apple, Waze, OpenStreetMap</li>
            <li><strong>Native Apps:</strong> Opens in installed map apps</li>
            <li><strong>Real-time Links:</strong> Always current coordinates</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
{:else}
  <div class="loading">
    <p>Loading GPS & AGPS location services...</p>
  </div>
{/if}

<!-- Image Enlargement Modal -->
{#if enlargedImage}
  <div 
    class="image-modal" 
    role="dialog" 
    aria-modal="true"
    aria-labelledby="modal-title"
    on:click={closeEnlargedImage}
    on:keydown={handleModalKeydown}
    tabindex="-1"
  >
    <div class="modal-content" role="document" on:click|stopPropagation>
      <div class="modal-header">
        <h3 id="modal-title">{enlargedImageTitle}</h3>
        <button 
          type="button"
          class="close-btn" 
          on:click={closeEnlargedImage}
          aria-label="Close enlarged map view"
        >
          ✕
        </button>
      </div>
      <div class="modal-image-container">
        <img 
          src={enlargedImage} 
          alt={enlargedImageTitle}
          class="enlarged-image"
        />
      </div>
      <div class="modal-footer">
        <p>Use mouse wheel or touch gestures to zoom • Drag to pan</p>
        <button 
          type="button"
          class="close-btn-footer" 
          on:click={closeEnlargedImage}
        >
          Close
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .map-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
  }

  .controls-section, .search-section, .location-display, .history-section, .tech-info {
    margin-bottom: 30px;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #f9f9f9;
  }

  .info-box {
    background: #e8f4fd;
    padding: 15px;
    border-radius: 6px;
    margin-bottom: 15px;
    border: 1px solid #2196F3;
  }

  .info-box h4 {
    margin: 0 0 10px 0;
    color: #1565C0;
  }

  .info-box ul {
    margin: 0;
    padding-left: 20px;
  }

  .info-box li {
    margin: 5px 0;
    font-size: 14px;
  }

  .tracking-info {
    background: #f3e5f5;
    padding: 15px;
    border-radius: 6px;
    margin-top: 15px;
  }

  .tracking-info p {
    margin: 5px 0;
  }

  .tracking-info ul {
    margin: 10px 0;
    padding-left: 20px;
  }

  .device-info {
    background: #fff3e0;
    padding: 10px;
    border-radius: 6px;
    margin-bottom: 15px;
  }

  .button-group {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .search-form {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
  }

  .search-form input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
  }

  button {
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .primary {
    background: #4CAF50;
    color: white;
  }

  .primary:hover:not(:disabled) {
    background: #45a049;
  }

  .large {
    padding: 15px 25px;
    font-size: 16px;
    font-weight: bold;
  }

  .secondary {
    background: #2196F3;
    color: white;
  }

  .secondary:hover:not(:disabled) {
    background: #1976D2;
  }

  .danger {
    background: #F44336;
    color: white;
  }

  .danger:hover:not(:disabled) {
    background: #D32F2F;
  }

  .copy-btn {
    background: #FF9800;
    color: white;
    padding: 5px 10px;
    font-size: 12px;
  }

  .dual-location-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }

  .location-card {
    padding: 15px;
    border-radius: 6px;
    border: 1px solid #eee;
  }

  .gps-card {
    background: #e8f5e8;
    border-color: #4CAF50;
    border-width: 2px;
  }

  .agps-card {
    background: #e3f2fd;
    border-color: #2196F3;
    border-width: 2px;
  }

  .primary-card {
    background: white;
  }

  .info-message {
    grid-column: 1 / -1;
    background: #fff3e0;
    padding: 15px;
    border-radius: 6px;
    text-align: center;
  }

  .coordinates, .metadata {
    margin: 10px 0;
  }

  .coords {
    font-family: monospace;
    font-size: 14px;
    margin: 10px 0;
  }

  .quick-links {
    margin-top: 10px;
  }

  .map-link-small {
    padding: 6px 10px;
    font-size: 12px;
    border-radius: 4px;
  }

  .address-card {
    background: white;
    padding: 15px;
    border-radius: 6px;
    border: 1px solid #eee;
    margin: 20px 0;
  }

  .formatted-address {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 15px;
    color: #333;
  }

  .address-details p {
    margin: 5px 0;
    font-size: 14px;
  }

  .map-links-section {
    margin: 20px 0;
    padding: 15px;
    background: white;
    border-radius: 6px;
    border: 1px solid #eee;
  }

  .map-links-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 10px;
    margin-top: 10px;
  }

  .map-link {
    padding: 8px 12px;
    font-size: 13px;
    border-radius: 4px;
    transition: transform 0.2s;
  }

  .map-link:hover {
    transform: translateY(-2px);
  }

  .google { background: #4285f4; color: white; }
  .osm { background: #7ebc6f; color: white; }
  .apple { background: #007aff; color: white; }
  .waze { background: #33ccff; color: white; }
  .bing { background: #00809d; color: white; }

  .static-map-section {
    margin: 20px 0;
    padding: 15px;
    background: white;
    border-radius: 6px;
    border: 1px solid #eee;
  }

  .map-container-inner {
    text-align: center;
  }

  .static-map {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
    border: 2px solid #ddd;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }

  .map-image-button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    border-radius: 6px;
    overflow: hidden;
  }

  .map-image-button:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 16px rgba(0,0,0,0.2);
  }

  .map-image-button:focus {
    outline: 2px solid #007bff;
    outline-offset: 2px;
  }

  .location-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .clear-cache-btn {
    background: #dc3545;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
  }

  .clear-cache-btn:hover {
    background: #c82333;
  }

  .best-location-card {
    background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
    border: 2px solid #2196f3;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(33, 150, 243, 0.1);
  }

  .best-location-card h3 {
    color: #1976d2;
    margin: 0 0 15px 0;
  }

  .map-caption {
    margin-top: 10px;
    font-size: 14px;
    color: #666;
    font-weight: bold;
  }

  .map-tech {
    margin-top: 5px;
    font-size: 12px;
    color: #999;
  }

  .map-loading {
    text-align: center;
    padding: 40px;
    background: #f5f5f5;
    border-radius: 6px;
  }

  .loading-detail {
    font-size: 14px;
    color: #666;
    margin-top: 10px;
  }

  .map-error {
    text-align: center;
    padding: 20px;
    background: #ffebee;
    border: 1px solid #f44336;
    border-radius: 6px;
    color: #d32f2f;
  }

  .map-controls {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
    padding: 10px;
    background: #f5f5f5;
    border-radius: 6px;
    flex-wrap: wrap;
  }

  .map-controls label {
    font-weight: bold;
    font-size: 14px;
  }

  .map-controls input[type="range"] {
    flex: 1;
    min-width: 100px;
  }

  .zoom-value {
    font-weight: bold;
    font-size: 16px;
    background: #007bff;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    min-width: 30px;
    text-align: center;
  }

  .refresh-btn, .retry-btn {
    background: #28a745;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
  }

  .refresh-btn:hover, .retry-btn:hover {
    background: #218838;
  }

  .refresh-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }

  .retry-btn {
    background: #dc3545;
    margin-top: 10px;
  }

  .retry-btn:hover {
    background: #c82333;
  }

  /* Image Modal Styles */
  .image-modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    cursor: pointer;
  }

  .modal-content {
    background: white;
    border-radius: 8px;
    max-width: 95vw;
    max-height: 95vh;
    display: flex;
    flex-direction: column;
    cursor: default;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
    background: #f8f9fa;
    border-radius: 8px 8px 0 0;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 18px;
    color: #333;
  }

  .close-btn {
    background: #dc3545;
    color: white;
    border: none;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
  }

  .close-btn:hover {
    background: #c82333;
  }

  .modal-image-container {
    flex: 1;
    overflow: auto;
    padding: 20px;
    text-align: center;
    max-height: 70vh;
  }

  .enlarged-image {
    max-width: 100%;
    height: auto;
    border-radius: 6px;
    cursor: grab;
    transition: transform 0.1s;
  }

  .enlarged-image:active {
    cursor: grabbing;
  }

  .modal-footer {
    padding: 15px 20px;
    border-top: 1px solid #eee;
    background: #f8f9fa;
    border-radius: 0 0 8px 8px;
    text-align: center;
  }

  .modal-footer p {
    margin: 0 0 10px 0;
    font-size: 14px;
    color: #666;
  }

  .close-btn-footer {
    background: #6c757d;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
  }

  .close-btn-footer:hover {
    background: #5a6268;
  }

  .search-results {
    margin-top: 15px;
  }

  .result-card {
    background: white;
    padding: 15px;
    border-radius: 6px;
    border: 1px solid #eee;
  }

  .history-entry {
    background: white;
    padding: 10px;
    margin-bottom: 10px;
    border-radius: 6px;
    border: 1px solid #eee;
  }

  .history-entry p {
    margin: 5px 0;
    font-size: 14px;
  }

  .accuracy {
    font-family: monospace;
    color: #666;
  }

  .error-display {
    background: #ffebee;
    border: 1px solid #f44336;
    border-radius: 6px;
    padding: 15px;
    margin: 20px 0;
  }

  .error-display h3 {
    color: #f44336;
    margin: 0 0 10px 0;
  }

  .error-help {
    font-size: 14px;
    color: #666;
    margin-top: 10px;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
  }

  .info-card {
    background: white;
    padding: 15px;
    border-radius: 6px;
    border: 1px solid #eee;
  }

  .info-card h3 {
    margin: 0 0 10px 0;
    color: #333;
  }

  .info-card ul {
    margin: 0;
    padding-left: 20px;
  }

  .info-card li {
    margin: 5px 0;
    font-size: 14px;
  }

  .loading {
    text-align: center;
    padding: 40px;
  }

  @media (max-width: 768px) {
    .dual-location-grid {
      grid-template-columns: 1fr;
    }
    
    .button-group {
      flex-direction: column;
    }
    
    .search-form {
      flex-direction: column;
    }

    .map-links-grid {
      grid-template-columns: 1fr 1fr;
    }

    .map-controls {
      flex-direction: column;
      align-items: stretch;
      gap: 8px;
    }

    .map-controls input[type="range"] {
      width: 100%;
    }

    .modal-content {
      max-width: 98vw;
      max-height: 98vh;
    }

    .modal-image-container {
      max-height: 60vh;
    }

    .enlarged-image {
      width: 100%;
      height: auto;
    }
  }
</style>
