import { ref, reactive, readonly, onMounted, onUnmounted, computed, watch } from 'vue';
import { useAuth } from './useAuth';

// Create global state for the player
const player = ref(null);
const deviceId = ref(null);
const isReady = ref(false);
const error = ref(null);
const currentState = ref(null);
const isPlaying = ref(false);
const currentTrack = ref(null);
const refreshTimer = ref(null);
// Track retry attempts to prevent infinite loops
const retryAttempts = ref(0);
const maxRetries = 2;

export function usePlayer() {
  const { state: authState, fetchWithAuth, refreshToken } = useAuth();
  
  // Initialize Spotify Web Playback SDK
  const initializePlayer = async () => {
    // Don't reinitialize if player already exists
    if (player.value) {
      console.log('Player already initialized');
      return player.value;
    }
    
    // First, ensure the Spotify Web Playback SDK script is loaded
    await loadSpotifySdk();
    
    if (!window.Spotify || !authState.accessToken) {
      error.value = 'Spotify SDK or access token not available';
      console.error('Spotify SDK or access token not available');
      return null;
    }
    
    try {
      console.log('Initializing Spotify player with token:', authState.accessToken.substring(0, 5) + '...');
      
      // Create a new player instance
      player.value = new window.Spotify.Player({
        name: 'Spotify Clone Web Player',
        getOAuthToken: async callback => {
          // Check if token is expired and refresh if needed
          const isTokenExpired = authState.expiresAt && Date.now() > (authState.expiresAt - 60000);
          if (isTokenExpired && authState.refreshToken) {
            try {
              await refreshToken();
              callback(authState.accessToken);
            } catch (error) {
              console.error('Failed to refresh token for SDK:', error);
              callback(authState.accessToken); // Use existing token as fallback
            }
          } else {
            callback(authState.accessToken);
          }
        },
        volume: 0.5
      });
      
      // Add event listeners
      player.value.addListener('ready', ({ device_id }) => {
        console.log('Spotify Player ready with Device ID:', device_id);
        deviceId.value = device_id;
        isReady.value = true;
        // Reset retry counter when device is ready
        retryAttempts.value = 0;
        
        // Start updating player status periodically
        startPlayerStatusRefresh();
        
        // Try to transfer playback to this device
        setTimeout(() => {
          transferPlayback(device_id);
        }, 1000);
      });
      
      player.value.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID is not ready for playback', device_id);
        isReady.value = false;
      });
      
      player.value.addListener('player_state_changed', state => {
        if (!state) {
          currentState.value = null;
          isPlaying.value = false;
          return;
        }
        
        currentState.value = state;
        isPlaying.value = !state.paused;
        
        // Update current track from state
        if (state.track_window && state.track_window.current_track) {
          currentTrack.value = {
            uri: state.track_window.current_track.uri,
            id: state.track_window.current_track.id,
            name: state.track_window.current_track.name,
            artists: state.track_window.current_track.artists,
            album: state.track_window.current_track.album,
            duration_ms: state.track_window.current_track.duration_ms,
          };
        }
        
        console.log('Player state changed, playing:', !state.paused);
      });
      
      player.value.addListener('initialization_error', ({ message }) => {
        console.error('Failed to initialize player:', message);
        error.value = `Player initialization failed: ${message}`;
      });
      
      player.value.addListener('authentication_error', ({ message }) => {
        console.error('Authentication failed:', message);
        error.value = `Authentication failed: ${message}`;
        
        // Try to refresh token on authentication errors and reconnect player
        if (authState.refreshToken) {
          refreshToken()
            .then(() => {
              // Reconnect player with new token
              player.value.connect();
            })
            .catch(err => {
              console.error('Failed to refresh token after auth error:', err);
            });
        }
      });
      
      player.value.addListener('account_error', ({ message }) => {
        console.error('Account error:', message);
        error.value = `Account error: ${message}`;
      });
      
      // Connect the player
      const connected = await player.value.connect();
      
      if (connected) {
        console.log('Spotify Player connected successfully');
      } else {
        console.error('Failed to connect Spotify Player');
        error.value = 'Failed to connect player';
      }
      
      return player.value;
      
    } catch (err) {
      console.error('Error initializing Spotify player:', err);
      error.value = `Error initializing player: ${err.message}`;
      return null;
    }
  };
  
  // Better approach: Transfer playback to this device using transfer endpoint
  const transferPlayback = async (targetDeviceId) => {
    if (!targetDeviceId) {
      targetDeviceId = deviceId.value;
    }
    
    if (!targetDeviceId) {
      console.warn('No device ID available for transfer');
      return false;
    }
    
    try {
      console.log('Transferring playback to device:', targetDeviceId);
      
      // First check if we need to refresh the token
      if (authState.expiresAt && Date.now() > (authState.expiresAt - 60000)) {
        await refreshToken();
      }
      
      const response = await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authState.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          device_ids: [targetDeviceId],
          // Don't auto-start playback
          play: false
        })
      });
      
      // 202 Accepted is the expected response for this endpoint
      if (response.status === 202 || response.status === 204) {
        console.log('Playback transferred successfully');
        return true;
      }
      
      console.error('Failed to transfer playback, status:', response.status);
      return false;
      
    } catch (err) {
      console.error('Error transferring playback:', err);
      return false;
    }
  };
  
  // Deprecated - keep for compatibility
  const setActiveDevice = transferPlayback;
  
  // Load the Spotify Web Playback SDK
  const loadSpotifySdk = () => {
    return new Promise((resolve, reject) => {
      if (window.Spotify) {
        resolve();
        return;
      }
      
      // IMPORTANT: Define the callback function BEFORE loading the script
      // This function must be in the global scope so the SDK can call it
      window.onSpotifyWebPlaybackSDKReady = () => {
        console.log('Spotify Web Playback SDK loaded');
        resolve();
      };
      
      const script = document.createElement('script');
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      script.async = true;
      
      script.onerror = (err) => {
        error.value = 'Failed to load Spotify SDK';
        reject(new Error('Failed to load Spotify SDK'));
      };
      
      document.body.appendChild(script);
    });
  };
  
  // Start a periodic timer to refresh player status
  const startPlayerStatusRefresh = () => {
    // Clear any existing timer
    if (refreshTimer.value) {
      clearInterval(refreshTimer.value);
    }
    
    // Update player status every 5 seconds
    refreshTimer.value = setInterval(async () => {
      if (isReady.value && authState.accessToken) {
        try {
          const status = await getPlayerStatus();
          
          // If another device is active, don't try to constantly change it
          // Only try to make this the active device if no device is active
          if (!status || (!status.device && deviceId.value)) {
            await transferPlayback(deviceId.value);
          }
          
          // Update track info from API if SDK doesn't provide it
          if (status && status.item && (!currentTrack.value || currentTrack.value.id !== status.item.id)) {
            currentTrack.value = status.item;
          }
          
          // Update playing state
          if (status) {
            isPlaying.value = status.is_playing;
          }
        } catch (error) {
          console.error('Error refreshing player status:', error);
        }
      }
    }, 5000);
  };
  
  // Play a specific track or album
  const play = async (uri, isRetry = false) => {
    try {
      // Reset retry counter if this is a fresh play request
      if (!isRetry) {
        retryAttempts.value = 0;
      }
      
      console.log('Attempting to play URI:', uri);
      
      // Ensure we have a valid access token
      if (!authState.accessToken) {
        console.error('No access token available for playback');
        error.value = 'Login required to play music';
        return;
      }
      
      // First make sure our device is active
      if (!deviceId.value) {
        console.error('No device ID available for playback');
        error.value = 'Player not initialized properly';
        return;
      }
      
      // Always refresh token before attempting to play
      if (authState.refreshToken) {
        try {
          await refreshToken();
        } catch (refreshError) {
          console.error('Failed to refresh token before playback:', refreshError);
        }
      }
      
      // Try to transfer playback first if this is a retry
      if (isRetry) {
        await transferPlayback(deviceId.value);
        
        // Add a slight delay to allow Spotify to register the device change
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Determine if it's an album, playlist or track
      let playOptions = {};
      
      if (uri.includes('track')) {
        // For individual tracks
        playOptions = { uris: [uri] };
      } else {
        // For albums or playlists
        playOptions = { context_uri: uri };
      }
      
      // Use direct fetch with fresh token
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId.value}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${authState.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(playOptions)
      });
      
      // Check for success
      if (response.ok) {
        console.log('Playback started successfully');
        isPlaying.value = true;
        // Reset retry counter on success
        retryAttempts.value = 0;
        
        // Update track info after a short delay
        setTimeout(async () => {
          try {
            const status = await getPlayerStatus();
            if (status && status.item) {
              currentTrack.value = status.item;
            }
          } catch (err) {
            console.warn('Could not update track info after play:', err);
          }
        }, 500);
        
        return true;
      }
      
      // Handle errors
      const errorText = await response.text();
      console.error(`Play request failed: ${response.status} ${errorText}`);
      
      // Only attempt retry if under the max retry count
      if (response.status === 404 && retryAttempts.value < maxRetries) {
        retryAttempts.value += 1;
        console.log(`Retry attempt ${retryAttempts.value} of ${maxRetries}`);
        
        // Try to transfer playback first
        await transferPlayback(deviceId.value);
        
        // Wait longer between retries
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Try play again
        return await play(uri, true);
      }
      
      // If all retries failed or another error occurred
      error.value = `Could not play track: ${response.status} ${errorText}`;
      throw new Error(`Failed to start playback: ${response.status} ${errorText}`);
      
    } catch (err) {
      console.error('Error playing track:', err);
      error.value = `Error playing: ${err.message || 'Unknown error'}`;
      return false;
    }
  };
  
  // Pause playback
  const pause = async () => {
    if (!player.value || !isReady.value) {
      console.warn('Player not ready for pause command');
      return;
    }
    
    try {
      await player.value.pause();
      isPlaying.value = false;
    } catch (err) {
      console.error('Error pausing playback:', err);
    }
  };
  
  // Resume playback
  const resume = async () => {
    if (!player.value || !isReady.value) {
      console.warn('Player not ready for resume command');
      return;
    }
    
    try {
      await player.value.resume();
      isPlaying.value = true;
    } catch (err) {
      console.error('Error resuming playback:', err);
    }
  };
  
  // Toggle play/pause
  const togglePlay = async () => {
    console.log('Toggle play called, isPlaying:', isPlaying.value);
    if (!player.value || !isReady.value) {
      console.warn('Player not ready for togglePlay');
      return;
    }
    
    try {
      if (isPlaying.value) {
        await pause();
      } else {
        await resume();
      }
    } catch (err) {
      console.error('Error toggling play state:', err);
    }
  };
  
  // Skip to next track
  const nextTrack = async () => {
    if (!player.value || !isReady.value) return;
    
    try {
      await player.value.nextTrack();
      
      // Get updated track after changing
      setTimeout(async () => {
        const status = await getPlayerStatus();
        if (status && status.item) {
          currentTrack.value = status.item;
        }
      }, 500);
    } catch (err) {
      console.error('Error skipping to next track:', err);
    }
  };
  
  // Go back to previous track
  const previousTrack = async () => {
    if (!player.value || !isReady.value) return;
    
    try {
      await player.value.previousTrack();
      
      // Get updated track after changing
      setTimeout(async () => {
        const status = await getPlayerStatus();
        if (status && status.item) {
          currentTrack.value = status.item;
        }
      }, 500);
    } catch (err) {
      console.error('Error going to previous track:', err);
    }
  };
  
  // Seek to position in currently playing track
  const seek = async (positionMs) => {
    if (!player.value || !isReady.value) return;
    
    try {
      await player.value.seek(positionMs);
    } catch (err) {
      console.error('Error seeking to position:', err);
    }
  };
  
  // Get current playback state from Spotify API (not just SDK)
  const getPlayerStatus = async () => {
    if (!authState.accessToken) {
      console.error('No access token available for player status');
      return null;
    }
    
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player', {
        headers: {
          'Authorization': `Bearer ${authState.accessToken}`
        }
      });
      
      if (response.status === 204) {
        // No content means no active player
        return null;
      }
      
      if (!response.ok) {
        throw new Error(`Failed to get player status: ${response.status}`);
      }
      
      return await response.json();
    } catch (err) {
      console.error('Error getting player status:', err);
      return null;
    }
  };
  
  // Get volume
  const getVolume = async () => {
    if (!player.value || !isReady.value) return 0;
    
    try {
      return await player.value.getVolume();
    } catch (err) {
      console.error('Error getting volume:', err);
      return 0;
    }
  };
  
  // Set volume (0 to 1)
  const setVolume = async (volumeLevel) => {
    if (!player.value || !isReady.value) return;
    
    try {
      await player.value.setVolume(volumeLevel);
    } catch (err) {
      console.error('Error setting volume:', err);
    }
  };
  
  // Clean up on unmount
  onUnmounted(() => {
    if (refreshTimer.value) {
      clearInterval(refreshTimer.value);
    }
    
    if (player.value) {
      player.value.disconnect();
    }
  });
  
  // Auto-initialize if auth token is available
  if (authState.accessToken && !player.value) {
    console.log('Auto-initializing player with token');
    initializePlayer();
  }
  
  return {
    player,
    deviceId: readonly(deviceId),
    isReady: readonly(isReady),
    isPlaying: readonly(isPlaying),
    currentState: readonly(currentState),
    currentTrack: readonly(currentTrack),
    error: readonly(error),
    initializePlayer,
    play,
    pause,
    resume,
    togglePlay,
    nextTrack,
    previousTrack,
    seek,
    getPlayerStatus,
    getVolume,
    setVolume
  };
}