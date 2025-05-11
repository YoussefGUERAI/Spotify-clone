<template>
  <div class="playlist-grid-container">
    <h2 class="section-title">{{ title }}</h2>
    
    <div class="playlist-grid">
      <div v-for="(playlist, index) in playlists" :key="index" class="playlist-item">
        <div class="playlist-cover">
          <img 
            v-if="playlist.images && playlist.images.length" 
            :src="playlist.images[0].url" 
            :alt="playlist.name" 
            class="cover-image"
          />
          <div v-else class="cover-placeholder">
            <i class="fas fa-music"></i>
          </div>
        </div>
        
        <div class="playlist-details">
          <h3 class="playlist-name">{{ playlist.name }}</h3>
          <p class="playlist-owner">By {{ playlist.owner.display_name }}</p>
          <p class="playlist-tracks">{{ playlist.tracks.total }} tracks</p>
        </div>
      </div>
    </div>
    
    <div v-if="showLoadMore && nextPage" class="load-more">
      <button @click="onLoadMore" :disabled="loading" class="load-more-button">
        <span v-if="!loading">Load More</span>
        <span v-else>Loading...</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: 'Playlists'
  },
  playlists: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  nextPage: {
    type: Boolean,
    default: false
  },
  showLoadMore: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['loadMore']);

const onLoadMore = () => {
  emit('loadMore');
};
</script>

<style scoped>
.playlist-grid-container {
  padding: 20px 0;
}

.section-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  padding: 0 20px;
}

.playlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;
  padding: 0 20px;
}

.playlist-item {
  background-color: #181818;
  padding: 16px;
  border-radius: 8px;
  transition: background-color 0.3s;
  cursor: pointer;
}

.playlist-item:hover {
  background-color: #282828;
}

.playlist-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  margin-bottom: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #282828;
  border-radius: 4px;
  color: #b3b3b3;
  font-size: 3rem;
}

.playlist-details {
  color: white;
}

.playlist-name {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 8px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-owner, .playlist-tracks {
  font-size: 14px;
  color: #b3b3b3;
  margin: 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.load-more-button {
  background-color: transparent;
  color: white;
  border: 1px solid #727272;
  border-radius: 20px;
  padding: 8px 32px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.load-more-button:hover:not(:disabled) {
  border-color: white;
  transform: scale(1.05);
}

.load-more-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>