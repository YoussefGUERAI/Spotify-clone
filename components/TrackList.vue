<template>
  <div class="track-list-container">
    <table class="track-list">
      <thead>
        <tr>
          <th class="track-number">#</th>
          <th class="track-title">Title</th>
          <th class="track-duration">Duration</th>
          <th class="track-actions"></th>
        </tr>
      </thead>
      <tbody>
        <tr 
          v-for="(track, index) in tracks" 
          :key="track.id"
          class="track-item"
          :class="{ 'track-playing': isTrackPlaying(track) }"
        >
          <td class="track-number">
            <span class="track-index">{{ index + 1 }}</span>
            <button @click="playTrack(track)" class="play-button">
              <i class="fas" :class="isTrackPlaying(track) ? 'fa-pause' : 'fa-play'"></i>
            </button>
          </td>
          <td class="track-title">
            <div class="track-info">
              <div v-if="showArtwork && track.album" class="track-image">
                <img :src="track.album.images?.[0]?.url" alt="Album Art" />
              </div>
              <div class="track-text">
                <div class="track-name">{{ track.name }}</div>
                <div class="track-artist">{{ getArtists(track) }}</div>
              </div>
            </div>
          </td>
          <td class="track-duration">{{ formatDuration(track.duration_ms) }}</td>
          <td class="track-actions">
            <button class="action-button" title="Add to library">
              <i class="far fa-heart"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  tracks: {
    type: Array,
    required: true
  },
  showArtwork: {
    type: Boolean,
    default: false
  },
  currentlyPlaying: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['play']);

const formatDuration = (ms) => {
  if (!ms) return '0:00';
  
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const getArtists = (track) => {
  if (!track.artists) return '';
  return track.artists.map(artist => artist.name).join(', ');
};

const playTrack = (track) => {
  if (isTrackPlaying(track)) {
    // If it's the currently playing track, emit a toggle event
    emit('play', { item: track, uri: `spotify:track:${track.id}`, toggle: true });
  } else {
    // Otherwise, play this track
    emit('play', { item: track, uri: `spotify:track:${track.id}` });
  }
};

const isTrackPlaying = (track) => {
  if (!props.currentlyPlaying || !track) return false;
  return props.currentlyPlaying.id === track.id;
};
</script>

<style scoped>
.track-list-container {
  width: 100%;
  overflow-x: auto;
}

.track-list {
  width: 100%;
  border-collapse: collapse;
  color: white;
  font-size: 14px;
}

.track-list th {
  text-align: left;
  padding: 10px 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #b3b3b3;
  font-weight: 400;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.track-item {
  height: 56px;
  transition: background-color 0.2s ease;
}

.track-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.track-item td {
  padding: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.track-number {
  width: 48px;
  text-align: center;
  position: relative;
}

.track-index {
  display: inline-block;
  color: #b3b3b3;
}

.track-item:hover .track-index {
  display: none;
}

.play-button {
  display: none;
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 12px;
  padding: 0;
  width: 24px;
  height: 24px;
}

.track-item:hover .play-button {
  display: inline-block;
}

.track-playing .play-button {
  display: inline-block;
  color: #1DB954;
}

.track-playing .track-index {
  display: none;
}

.track-playing {
  color: #1DB954;
}

.track-title {
  max-width: 400px;
}

.track-info {
  display: flex;
  align-items: center;
}

.track-image {
  width: 40px;
  height: 40px;
  margin-right: 16px;
  flex-shrink: 0;
}

.track-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.track-text {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.track-name {
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-artist {
  font-size: 12px;
  color: #b3b3b3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.track-duration {
  color: #b3b3b3;
  text-align: right;
  width: 80px;
}

.track-actions {
  text-align: right;
  width: 60px;
}

.action-button {
  background: transparent;
  border: none;
  color: #b3b3b3;
  cursor: pointer;
  padding: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.track-item:hover .action-button {
  opacity: 1;
}

.action-button:hover {
  color: white;
}
</style>