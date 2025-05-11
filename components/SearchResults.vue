<template>
  <div v-if="results" class="search-results">
    <div class="results-header">
      <h2>Search Results</h2>
      <button class="close-btn" @click="onClose">
        <i class="fas fa-times"></i>
      </button>
    </div>
    
    <!-- Tracks Section -->
    <div v-if="results.tracks && results.tracks.items.length" class="results-section">
      <h3>Songs</h3>
      <div class="result-list">
        <div 
          v-for="track in results.tracks.items.slice(0, 5)" 
          :key="track.id"
          class="result-item" 
          @click="playTrack(track.uri)"
        >
          <img 
            :src="track.album.images && track.album.images.length ? track.album.images[2].url : ''" 
            alt="Track" 
            class="result-img"
          />
          <div class="result-info">
            <div class="result-name">{{ track.name }}</div>
            <div class="result-subtitle">{{ track.artists.map(a => a.name).join(', ') }}</div>
          </div>
          <i class="fas fa-play play-icon"></i>
        </div>
      </div>
    </div>
    
    <!-- Albums Section -->
    <div v-if="results.albums && results.albums.items.length" class="results-section">
      <h3>Albums</h3>
      <div class="result-list">
        <div 
          v-for="album in results.albums.items.slice(0, 5)" 
          :key="album.id" 
          class="result-item"
          @click="navigateToAlbum(album.id)"
        >
          <img 
            :src="album.images && album.images.length ? album.images[2].url : ''" 
            alt="Album" 
            class="result-img"
          />
          <div class="result-info">
            <div class="result-name">{{ album.name }}</div>
            <div class="result-subtitle">{{ album.artists.map(a => a.name).join(', ') }}</div>
          </div>
          <i class="fas fa-chevron-right"></i>
        </div>
      </div>
    </div>
    
    <!-- Artists Section (if added to search types) -->
    <div v-if="results.artists && results.artists.items.length" class="results-section">
      <h3>Artists</h3>
      <div class="result-list">
        <div 
          v-for="artist in results.artists.items.slice(0, 5)" 
          :key="artist.id" 
          class="result-item"
        >
          <img 
            :src="artist.images && artist.images.length ? artist.images[2].url : ''" 
            alt="Artist" 
            class="result-img result-img-circle"
          />
          <div class="result-info">
            <div class="result-name">{{ artist.name }}</div>
            <div class="result-subtitle">Artist</div>
          </div>
          <i class="fas fa-chevron-right"></i>
        </div>
      </div>
    </div>
    
    <!-- No results message -->
    <div v-if="noResults" class="no-results">
      <p>No results found for "{{ searchQuery }}"</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayer } from '../composables/usePlayer';

const props = defineProps({
  results: Object,
  searchQuery: String,
  onClose: Function
});

const router = useRouter();
const { play } = usePlayer();

const noResults = computed(() => {
  if (!props.results) return false;
  
  const tracks = props.results.tracks?.items?.length || 0;
  const albums = props.results.albums?.items?.length || 0;
  const artists = props.results.artists?.items?.length || 0;
  
  return tracks === 0 && albums === 0 && artists === 0;
});

const navigateToAlbum = (albumId) => {
  router.push(`/album/${albumId}`);
};

const playTrack = (uri) => {
  play(uri);
};
</script>

<style scoped>
.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 70vh;
  overflow-y: auto;
  background-color: #282828;
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  padding: 16px;
  margin-top: 8px;
  color: #fff;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid #3e3e3e;
  padding-bottom: 8px;
}

.results-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.close-btn {
  background: none;
  border: none;
  color: #b3b3b3;
  cursor: pointer;
  font-size: 16px;
}

.close-btn:hover {
  color: #fff;
}

.results-section {
  margin-bottom: 20px;
}

.results-section h3 {
  font-size: 16px;
  margin-bottom: 12px;
  color: #b3b3b3;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.result-item:hover {
  background-color: #3e3e3e;
}

.result-item:hover .play-icon {
  opacity: 1;
}

.result-img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  margin-right: 12px;
}

.result-img-circle {
  border-radius: 50%;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-name {
  font-weight: 500;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.result-subtitle {
  color: #b3b3b3;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.play-icon {
  color: #1DB954;
  opacity: 0;
  transition: opacity 0.2s;
}

.no-results {
  text-align: center;
  padding: 32px 0;
  color: #b3b3b3;
}
</style>