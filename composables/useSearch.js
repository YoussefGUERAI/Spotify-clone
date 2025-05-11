import { ref } from 'vue';
import { useAuth } from './useAuth';

export function useSearch() {
  const { fetchWithAuth } = useAuth();
  
  const searchResults = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  
  /**
   * Search for tracks, albums, and artists using Spotify's API
   * @param {string} query - The search query
   * @param {string[]} types - Array of types to search for: 'track', 'album', 'artist', 'playlist'
   * @param {number} limit - Maximum number of results per type
   */
  const search = async (query, types = ['track', 'album'], limit = 10) => {
    if (!query || query.trim() === '') {
      searchResults.value = null;
      return;
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
      const typesParam = types.join(',');
      const response = await fetchWithAuth(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=${typesParam}&limit=${limit}`
      );
      
      searchResults.value = response;
      return response;
    } catch (err) {
      console.error('Search error:', err);
      error.value = 'Failed to search: ' + (err.message || 'Unknown error');
      return null;
    } finally {
      isLoading.value = false;
    }
  };
  
  const clearSearch = () => {
    searchResults.value = null;
    error.value = null;
  };
  
  return {
    search,
    clearSearch,
    searchResults,
    isLoading,
    error
  };
}