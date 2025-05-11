<template>
    <NavBar />
  <div class="playlist-page">
    <div v-if="playlistData" class="playlist-header">
      <div class="playlist-cover">
        <img 
          v-if="playlistData.images && playlistData.images.length" 
          :src="playlistData.images[0].url" 
          alt="Playlist Cover" 
        />
        <div v-else class="placeholder-cover">
          <i class="fas fa-music"></i>
        </div>
      </div>
      <div class="playlist-info">
        <div class="playlist-type">Playlist</div>
        <h1 class="playlist-title">{{ playlistData.name }}</h1>
        <div class="playlist-description" v-if="playlistData.description">
          {{ playlistData.description }}
        </div>
        <div class="playlist-meta">
          <span class="playlist-owner">{{ playlistData.owner?.display_name || 'Unknown' }}</span>
          <span class="playlist-count">{{ playlistData.tracks?.total || 0 }} songs</span>
        </div>
      </div>
    </div>

    <div class="playlist-actions">
      <button class="play-button" @click="playPlaylist">
        <i class="fas fa-play"></i> Play
      </button>
    </div>

    <div v-if="isLoading" class="loading-state">
      Loading tracks...
    </div>
    
    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>
    
    <div v-else-if="tracks.length === 0" class="empty-state">
      This playlist doesn't have any tracks yet.
    </div>

    <div v-else class="playlist-content">
      <TrackList 
        :tracks="tracks" 
        :currently-playing="currentTrack"
        :show-artwork="true"
        @play="handlePlayTrack" 
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from '~/composables/useAuth';
import { usePlayer } from '~/composables/usePlayer';
import TrackList from '~/components/TrackList.vue';
import NavBar from '~/components/NavBar.vue';

const route = useRoute();
const { fetchWithAuth, isAuthenticated } = useAuth();
const player = usePlayer();

const playlistId = computed(() => route.params.id);
const playlistData = ref(null);
const tracks = ref([]);
const isLoading = ref(true);
const error = ref(null);
const currentTrack = ref(null);

// Fetch playlist details
const fetchPlaylistData = async () => {
  isLoading.value = true;
  error.value = null;
  
  try {
    if (!isAuthenticated.value) {
      error.value = "Please log in to view this playlist";
      return;
    }
    
    // Fetch the playlist
    const data = await fetchWithAuth(`https://api.spotify.com/v1/playlists/${playlistId.value}`);
    playlistData.value = data;
    
    // Extract tracks from the playlist
    if (data.tracks && data.tracks.items) {
      // Map the tracks properly, handling the playlist track structure
      tracks.value = data.tracks.items
        .filter(item => item.track != null) // Filter out any null tracks
        .map(item => item.track); // Extract the actual track object
      
      console.log(`Loaded ${tracks.value.length} tracks from playlist`);
    } else {
      tracks.value = [];
      console.log('No tracks found in playlist response:', data);
    }
  } catch (err) {
    console.error('Error fetching playlist:', err);
    error.value = err.message || 'Failed to load playlist';
  } finally {
    isLoading.value = false;
  }
};

// Play all tracks in the playlist
const playPlaylist = async () => {
  if (!playlistData.value) return;
  
  try {
    await player.play(`spotify:playlist:${playlistId.value}`);
  } catch (err) {
    console.error('Error playing playlist:', err);
    error.value = 'Failed to play playlist';
  }
};

// Handle playing a specific track
const handlePlayTrack = async ({ item, uri, toggle }) => {
  if (!item) return;
  
  try {
    currentTrack.value = item;
    await player.play(uri);
  } catch (err) {
    console.error('Error playing track:', err);
  }
};

// Watch for route changes to reload data when navigating between playlists
watch(() => route.params.id, (newId, oldId) => {
  if (newId !== oldId) {
    fetchPlaylistData();
  }
});

// Fetch data when the component mounts
onMounted(fetchPlaylistData);
</script>

<style scoped>
.playlist-page {
  padding: 20px;
  color: white;
}

.playlist-header {
  display: flex;
  align-items: flex-end;
  margin-bottom: 24px;
  padding: 24px;
}

.playlist-cover {
  width: 230px;
  height: 230px;
  margin-right: 24px;
  box-shadow: 0 4px 60px rgba(0, 0, 0, 0.5);
}

.playlist-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-cover {
  width: 100%;
  height: 100%;
  background-color: #282828;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
  color: #7f7f7f;
}

.playlist-info {
  flex: 1;
}

.playlist-type {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 4px;
}

.playlist-title {
  font-size: 96px;
  font-weight: 900;
  margin: 0;
  padding: 0;
  line-height: 1;
}

.playlist-description {
  margin: 8px 0;
  color: #b3b3b3;
  font-size: 14px;
}

.playlist-meta {
  margin-top: 16px;
  font-size: 14px;
}

.playlist-owner {
  font-weight: 700;
  margin-right: 4px;
}

.playlist-owner::after {
  content: "•";
  margin: 0 4px;
}

.playlist-count {
  color: #b3b3b3;
}

.playlist-actions {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 24px;
}

.play-button {
  border: none;
  background-color: #1DB954;
  color: white;
  font-size: 16px;
  font-weight: 700;
  padding: 14px 32px;
  border-radius: 32px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.play-button i {
  margin-right: 8px;
}

.play-button:hover {
  transform: scale(1.05);
  background-color: #1ed760;
}

.playlist-content {
  padding: 0 24px;
}

.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 40px;
  color: #b3b3b3;
  font-size: 16px;
}

.error-state {
  color: #ff5252;
}

@media (max-width: 768px) {
  .playlist-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .playlist-cover {
    margin-right: 0;
    margin-bottom: 16px;
    width: 200px;
    height: 200px;
  }
  
  .playlist-title {
    font-size: 48px;
  }
}
</style>