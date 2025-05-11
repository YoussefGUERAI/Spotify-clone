<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import Navbar from '../components/NavBar.vue';
import HorizontalSection from '../components/HorizontalSection.vue';
import PlaylistGrid from '../components/PlaylistGrid.vue';
import { useAuth } from '../composables/useAuth';

// Use the auth composable
const { state: authState, fetchWithAuth, isAuthenticated, fetchUserPlaylists } = useAuth();
const releases = ref(null);
const loading = ref(true);
const error = ref(null);
const userPlaylists = ref(null);
const currentlyPlayingItem = ref(null);

// Define props and emits
const props = defineProps({
  currentTrack: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['play']);

// Format user playlists for the HorizontalSection component
const formattedUserPlaylists = computed(() => {
  if (!authState.playlists || !authState.playlists.items) {
    return [];
  }
  return authState.playlists.items;
});

const fetchNewReleases = async() => {
  try {
    if (!isAuthenticated.value) {
      console.log('Not authenticated for new releases');
      return;
    }
    
    const response = await fetchWithAuth('https://api.spotify.com/v1/browse/new-releases?country=US');
    releases.value = response;
  } catch (err) {
    console.error('Spotify fetch failed:', err);
    error.value = 'Failed to load new releases';
  } finally {
    // Make sure to set loading to false when done
    loading.value = false;
  }
};

const fetchPlaylists = async() => {
  try {
    if (!isAuthenticated.value) {
      console.log('Not authenticated for user playlists');
      return;
    }
    
    await fetchUserPlaylists();
    userPlaylists.value = authState.playlists;
  } catch (err) {
    console.error('Failed to fetch user playlists:', err);
    error.value = 'Failed to load your playlists';
  } finally {
    loading.value = false;
  }
};

// Handle play events from child components
const handlePlay = (playData) => {
  currentlyPlayingItem.value = playData.item;
  emit('play', playData);
};

// Track current playback
watch(() => props.currentTrack, (newTrack) => {
  if (newTrack) {
    // Update current playing item based on what's playing
    currentlyPlayingItem.value = {
      id: newTrack.id,
      type: newTrack.type,
      name: newTrack.name
    };
  } else {
    currentlyPlayingItem.value = null;
  }
}, { deep: true });

// Call the fetch functions when the component is mounted
onMounted(() => {
  if (isAuthenticated.value) {
    fetchNewReleases();
    fetchPlaylists();
  } else {
    loading.value = false;
  }
});

// Watch for authentication state changes
watch(isAuthenticated, (isAuth) => {
  if (isAuth) {
    loading.value = true;
    fetchNewReleases();
    fetchPlaylists();
  }
});
</script>

<template>
  <div class="spotify-home">
    <Navbar />
    
    <div v-if="loading" class="content-state">
      <p>Loading content...</p>
    </div>
    
    <div v-else-if="error" class="content-state error">
      <p>{{ error }}</p>
    </div>
    
    <div v-else-if="!isAuthenticated" class="content-state">
      <p>Please log in to see personalized content</p>
    </div>
    
    <div v-else class="home-content">
      <div class="section-wrapper">
        <HorizontalSection
          v-if="releases?.albums?.items?.length"
          title="New Releases"
          :items="releases.albums.items"
          :currently-playing="currentlyPlayingItem"
          @play="handlePlay"
        />
      </div>
      
      <div class="section-wrapper">
        <HorizontalSection
          v-if="formattedUserPlaylists.length"
          title="Your Playlists"
          :items="formattedUserPlaylists"
          :currently-playing="currentlyPlayingItem"
          @play="handlePlay"
        />
      </div>
      
      <div v-if="isAuthenticated && !releases?.albums?.items?.length && !formattedUserPlaylists.length" 
           class="content-state">
        <p>No content available</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.spotify-home {
  background-color: #121212;
  color: #fff;
  min-height: 100vh;
  padding-bottom: 40px;
}

.home-content {
  padding: 20px;
  max-width: 1800px;
  margin: 0 auto;
}

.section-wrapper {
  margin-bottom: 40px;
}

.content-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: 18px;
  color: #b3b3b3;
}

.error {
  color: #ff5252;
}

.spotify-title {
  font-size: 28px;
  font-weight: 700;
  margin: 20px 0;
  padding: 0 20px;
}

.spotify-albums {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background-color: #000;
  color: #fff;
  padding: 20px;
}

.spotify-album-list {
  display: flex;
  overflow-x: auto;
  gap: 70px;
  padding: 10px 0;
  list-style: none;
  scroll-behavior: smooth;
}

.spotify-album {
  flex: 0 0 auto; /* prevents shrinking */
  width: 160px;

}
.spotify-album-list::-webkit-scrollbar {
  height: 8px;
}

.spotify-album-list::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}


.spotify-album-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  margin-bottom: 10px;
}

.spotify-album-details {
  margin-bottom: 10px;
}

.spotify-album-name {
  font-size: 16px;
  font-weight: bold;
}

.spotify-album-artist {
  font-size: 14px;
}

.spotify-loading {
  text-align: center;
  margin-top: 20px;
}
</style>

