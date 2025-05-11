import { reactive, readonly, computed, ref } from 'vue';

// Create a reactive state for authentication
const state = reactive({
  accessToken: null,
  refreshToken: null,
  expiresAt: null,
  profile: null,
  loading: false,
  error: null,
  playlists: null,
  isRefreshing: false
});

// A promise that resolves when token refresh is complete
let refreshPromise = null;

// Load initial state from localStorage if available
if (process.client) {
  const storedProfile = localStorage.getItem('spotify_profile');
  if (storedProfile) {
    try {
      state.profile = JSON.parse(storedProfile);
    } catch (error) {
      console.error('Error parsing stored profile', error);
    }
  }
  
  const storedToken = localStorage.getItem('spotify_access_token');
  if (storedToken) {
    state.accessToken = storedToken;
  }
  
  const storedRefreshToken = localStorage.getItem('spotify_refresh_token');
  if (storedRefreshToken) {
    state.refreshToken = storedRefreshToken;
  }
  
  const storedExpiry = localStorage.getItem('spotify_token_expires');
  if (storedExpiry) {
    state.expiresAt = parseInt(storedExpiry, 10);
  }
}

export function useAuth() {
  // Computed properties for auth state
  const isAuthenticated = computed(() => {
    return !!state.accessToken && !!state.profile && (state.expiresAt ? Date.now() < state.expiresAt : true);
  });
  
  // Save auth data to localStorage
  const saveAuthData = (tokenData, profile) => {
    if (process.client) {
      if (tokenData) {
        localStorage.setItem('spotify_access_token', tokenData.access_token);
        state.accessToken = tokenData.access_token;
        
        if (tokenData.refresh_token) {
          localStorage.setItem('spotify_refresh_token', tokenData.refresh_token);
          state.refreshToken = tokenData.refresh_token;
        }
        
        if (tokenData.expires_in) {
          const expiresAt = Date.now() + tokenData.expires_in * 1000;
          localStorage.setItem('spotify_token_expires', expiresAt.toString());
          state.expiresAt = expiresAt;
        }
      }
      
      if (profile) {
        localStorage.setItem('spotify_profile', JSON.stringify(profile));
        state.profile = profile;
      }
    }
  };
  
  // Clear auth data
  const clearAuthData = () => {
    state.accessToken = null;
    state.refreshToken = null;
    state.expiresAt = null;
    state.profile = null;
    state.error = null;
    
    if (process.client) {
      localStorage.removeItem('spotify_access_token');
      localStorage.removeItem('spotify_refresh_token');
      localStorage.removeItem('spotify_token_expires');
      localStorage.removeItem('spotify_profile');
    }
  };
  
  // Logout user
  const logout = () => {
    clearAuthData();
  };
  
  // Refresh the token
  const refreshToken = async () => {
    if (state.isRefreshing) {
      // If a refresh is in progress, return the existing promise
      return refreshPromise;
    }
    
    if (!state.refreshToken) {
      throw new Error('No refresh token available');
    }
    
    state.isRefreshing = true;
    
    // Create a new promise for this refresh operation
    refreshPromise = new Promise(async (resolve, reject) => {
      try {
        console.log('Refreshing access token...');
        const response = await fetch('/api/spotify/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refresh_token: state.refreshToken,
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Token refresh failed:', errorText);
          clearAuthData();
          reject(new Error(`Token refresh failed: ${response.status}`));
          return;
        }
        
        const tokenData = await response.json();
        
        // Save the new token data (note that refresh tokens might not always be included in the response)
        saveAuthData({ 
          access_token: tokenData.access_token, 
          expires_in: tokenData.expires_in,
          // Only update refresh token if a new one was provided
          refresh_token: tokenData.refresh_token || state.refreshToken
        });
        
        console.log('Token refreshed successfully');
        resolve(tokenData.access_token);
      } catch (error) {
        console.error('Error refreshing token:', error);
        clearAuthData();
        reject(error);
      } finally {
        state.isRefreshing = false;
      }
    });
    
    return refreshPromise;
  };
  
  // Helper function to make authenticated API requests
  const fetchWithAuth = async (url, options = {}) => {
    if (!state.accessToken) {
      throw new Error('Not authenticated');
    }
    
    // Check if token is about to expire (within 60 seconds) or has expired
    const isTokenExpired = state.expiresAt && Date.now() > (state.expiresAt - 60000);
    
    // If token is expired and we have a refresh token, try to refresh
    if (isTokenExpired && state.refreshToken) {
      try {
        await refreshToken();
      } catch (error) {
        console.error('Failed to refresh token', error);
        clearAuthData();
        throw new Error('Authentication expired');
      }
    }
    
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${state.accessToken}`
    };
    
    try {
      const response = await fetch(url, {
        ...options,
        headers
      });
      
      if (!response.ok) {
        // If we get a 401 Unauthorized, the token might have expired during the request
        // Try to refresh the token and retry the request once
        if (response.status === 401 && state.refreshToken && !options._isRetry) {
          try {
            await refreshToken();
            // Retry the request with the new token, but mark it as a retry
            return await fetchWithAuth(url, { ...options, _isRetry: true });
          } catch (refreshError) {
            clearAuthData();
            throw new Error('Authentication expired');
          }
        }
        
        throw new Error(`API request failed: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request error', error);
      throw error;
    }
  };
  
  // Fetch user playlists
  const fetchUserPlaylists = async (limit = 50, offset = 0, reset = true) => {
    if (!isAuthenticated.value) {
      throw new Error('User must be authenticated to fetch playlists');
    }
    
    try {
      state.loading = true;
      const response = await fetchWithAuth(
        `https://api.spotify.com/v1/me/playlists?limit=${limit}&offset=${offset}`
      );
      
      if (!state.playlists || reset) {
        // Replace existing playlists when reset is true (default)
        state.playlists = response;
      } else {
        // Append new items for pagination only when reset is false
        state.playlists.items = [...state.playlists.items, ...response.items];
        state.playlists.next = response.next;
      }
      
      return response;
    } catch (error) {
      console.error('Failed to fetch user playlists:', error);
      throw error;
    } finally {
      state.loading = false;
    }
  };
  
  // Fetch more playlists (pagination)
  const fetchMorePlaylists = async () => {
    if (!state.playlists || !state.playlists.next) {
      return null; // No more playlists to fetch
    }
    
    try {
      const nextUrl = state.playlists.next;
      const urlObj = new URL(nextUrl);
      const limit = urlObj.searchParams.get('limit') || 50;
      const offset = urlObj.searchParams.get('offset') || 0;
      
      // Pass false to indicate we're adding to existing playlists, not replacing
      return await fetchUserPlaylists(limit, offset, false);
    } catch (error) {
      console.error('Failed to fetch more playlists:', error);
      throw error;
    }
  };
  
  // Return readonly state and methods
  return {
    state: readonly(state),
    isAuthenticated,
    saveAuthData,
    clearAuthData,
    logout,
    fetchWithAuth,
    fetchUserPlaylists,
    fetchMorePlaylists,
    refreshToken
  };
}