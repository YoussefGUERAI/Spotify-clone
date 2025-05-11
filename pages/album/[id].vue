<template>
  <div class="album-view">
    <NavBar />
    
    <div v-if="loading" class="loading-state">
      <p>Loading album...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchAlbumData" class="retry-button">Retry</button>
    </div>
    
    <div v-else-if="album" class="album-content">
      <div class="album-header">
        <div class="album-cover">
          <img 
            v-if="album.images && album.images.length" 
            :src="album.images[0].url" 
            alt="Album Cover" 
          />
          <div v-else class="album-cover-placeholder">
            <i class="fas fa-music"></i>
          </div>
        </div>
        
        <div class="album-info">
          <div class="album-type">Album</div>
          <h1 class="album-title">{{ album.name }}</h1>
          <div class="album-meta">
            <div class="album-artist">
              <span v-for="(artist, i) in album.artists" :key="artist.id">
                {{ artist.name }}{{ i < album.artists.length - 1 ? ', ' : '' }}
              </span>
            </div>
            <div class="album-details">
              <span class="album-year">{{ formatReleaseDate(album.release_date) }}</span>
              <span class="album-tracks">{{ album.total_tracks }} tracks</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="album-actions">
        <button @click="playAlbum" class="play-button">
          <i class="fas" :class="isPlaying ? 'fa-pause' : 'fa-play'"></i>
          <span>{{ isPlaying ? 'Pause' : 'Play' }}</span>
        </button>
      </div>
      
      <TrackList 
        :tracks="albumTracks" 
        :currently-playing="currentTrack"
        :show-artwork="false"
        @play="handlePlayTrack" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '../../composables/useAuth';
import { usePlayer } from '../../composables/usePlayer';
import NavBar from '../../components/NavBar.vue';
import TrackList from '../../components/TrackList.vue';

const route = useRoute();
const { fetchWithAuth, isAuthenticated } = useAuth();
const player = usePlayer();

// State
const album = ref(null);
const albumTracks = ref([]);
const loading = ref(true);
const error = ref(null);
const isPlaying = ref(false);
const currentTrack = ref(null);

// Get album ID from route
const albumId = computed(() => route.params.id);

// Format release date
const formatReleaseDate = (date) => {
  if (!date) return '';
  // If it's just a year
  if (date.length === 4) return date;
  // Otherwise parse as date
  return new Date(date).getFullYear();
};

// Fetch album data
const fetchAlbumData = async () => {
  if (!isAuthenticated.value || !albumId.value) {
    loading.value = false;
    error.value = 'Please login to view this album';
    return;
  }
  
  loading.value = true;
  error.value = null;
  
  try {
    // Fetch album details
    const albumData = await fetchWithAuth(`https://api.spotify.com/v1/albums/${albumId.value}`);
    album.value = albumData;
    
    console.log('Album data loaded:', albumData.name);
    
    // Process tracks
    if (albumData.tracks && albumData.tracks.items) {
      // Add album data to each track (needed for the UI)
      albumTracks.value = albumData.tracks.items.map(track => ({
        ...track,
        album: {
          id: albumData.id,
          name: albumData.name,
          images: albumData.images
        }
      }));
      
      console.log(`Loaded ${albumTracks.value.length} tracks from album`);
    } else {
      console.warn('No tracks found in album data');
      albumTracks.value = [];
    }
  } catch (err) {
    console.error('Error fetching album:', err);
    error.value = 'Failed to load album data. Please try again later.';
  } finally {
    loading.value = false;
  }
};

// Play the entire album
const playAlbum = async () => {
  if (!album.value) return;
  
  try {
    if (isPlaying.value) {
      // Toggle play/pause if already playing
      await player.togglePlay();
      isPlaying.value = !isPlaying.value;
    } else {
      // Start playing the album
      await player.play(`spotify:album:${albumId.value}`);
      isPlaying.value = true;
    }
  } catch (err) {
    console.error('Error playing album:', err);
    error.value = 'Failed to play album';
  }
};

// Handle play event from track list
const handlePlayTrack = async ({ item, uri }) => {
  if (!item) return;
  
  try {
    currentTrack.value = item;
    await player.play(uri);
    isPlaying.value = true;
  } catch (err) {
    console.error('Error playing track:', err);
  }
};

// Watch for route changes to reload data when navigating between albums
watch(() => route.params.id, (newId, oldId) => {
  if (newId !== oldId) {
    fetchAlbumData();
    isPlaying.value = false;
    currentTrack.value = null;
  }
});

// Fetch data when component mounts
onMounted(() => {
  if (isAuthenticated.value) {
    fetchAlbumData();
  }
});

watch(isAuthenticated, (isAuth) => {
  if (isAuth) {
    fetchAlbumData();
  }
});
</script>

<style scoped>
.album-view {
  background-color: #121212;
  background-image: linear-gradient(rgba(0,0,0,0.6) 0%, #121212 100%);
  color: white;
  min-height: 100vh;
  padding-bottom: 120px;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #b3b3b3;
}

.error-state {
  color: #ff5252;
}

.retry-button {
  background-color: #1DB954;
  color: white;
  border: none;
  border-radius: 30px;
  padding: 10px 32px;
  margin-top: 16px;
  font-weight: bold;
  cursor: pointer;
}

.album-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.album-header {
  display: flex;
  align-items: center;
  padding: 24px 0;
}

.album-cover {
  width: 232px;
  height: 232px;
  margin-right: 24px;
  box-shadow: 0 4px 60px rgba(0, 0, 0, 0.5);
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.album-cover-placeholder {
  width: 100%;
  height: 100%;
  background-color: #282828;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  color: #b3b3b3;
}

.album-info {
  flex: 1;
}

.album-type {
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}

.album-title {
  font-size: 96px;
  font-weight: 900;
  margin: 0 0 16px 0;
  line-height: 1;
  letter-spacing: -0.04em;
}

.album-meta {
  margin-bottom: 16px;
}

.album-artist {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
}

.album-details {
  display: flex;
  font-size: 14px;
  color: #b3b3b3;
}

.album-year {
  margin-right: 8px;
}

.album-year::after {
  content: "•";
  margin: 0 8px;
}

.album-actions {
  padding: 24px 0;
  display: flex;
  align-items: center;
}

.play-button {
  background-color: #1DB954;
  color: white;
  border: none;
  border-radius: 32px;
  height: 56px;
  min-width: 120px;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 32px;
  margin-right: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.play-button:hover {
  background-color: #1ed760;
  transform: scale(1.04);
}

.play-button i {
  margin-right: 8px;
  font-size: 18px;
}

@media (max-width: 768px) {
  .album-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .album-cover {
    margin-right: 0;
    margin-bottom: 24px;
  }
  
  .album-title {
    font-size: 48px;
  }
  
  .album-artist {
    text-align: center;
  }
  
  .album-details {
    justify-content: center;
  }
}
</style>