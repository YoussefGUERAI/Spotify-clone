<template>
  <div class="player-bar" :class="{ active: currentTrack }">
    <div class="track-info">
      <div v-if="currentTrack" class="track-meta">
        <div class="track-image">
          <img 
            v-if="currentTrack.album?.images?.[0]?.url" 
            :src="currentTrack.album.images[0].url" 
            alt="Album Cover" 
          />
          <div v-else class="placeholder-image">
            <i class="fas fa-music"></i>
          </div>
        </div>
        <div class="track-text">
          <div class="track-title">{{ currentTrack.name }}</div>
          <div class="track-artist">{{ artistNames }}</div>
        </div>
        <button class="like-button">
          <i class="far fa-heart"></i>
        </button>
      </div>
    </div>
    
    <div class="player-controls">
      <div class="control-buttons">
        <button class="control-button" @click="shuffle" :class="{ active: isShuffleOn }">
          <i class="fas fa-random"></i>
        </button>
        <button class="control-button" @click="previousTrack">
          <i class="fas fa-step-backward"></i>
        </button>
        <button class="play-pause-button" @click="togglePlay">
          <i class="fas" :class="isPlaying ? 'fa-pause' : 'fa-play'"></i>
        </button>
        <button class="control-button" @click="nextTrack">
          <i class="fas fa-step-forward"></i>
        </button>
        <button class="control-button" @click="repeatMode" :class="{ active: repeatState !== 'off' }">
          <i class="fas" :class="repeatState === 'track' ? 'fa-repeat-1' : 'fa-repeat'"></i>
        </button>
      </div>
      
      <div class="progress-container">
        <div class="time current">{{ formatTime(currentPosition) }}</div>
        <div class="progress-bar" @click="seekPosition">
          <div class="progress-background"></div>
          <div class="progress-current" :style="{ width: progressPercentage }"></div>
          <div class="progress-handle" :style="{ left: progressPercentage }"></div>
        </div>
        <div class="time duration">{{ formatTime(trackDuration) }}</div>
      </div>
    </div>
    
    <div class="player-options">
      <button class="option-button">
        <i class="fas fa-list"></i>
      </button>
      <div class="volume-control">
        <i class="fas" :class="volumeIcon" @click="toggleMute"></i>
        <div class="volume-bar" @click="adjustVolume">
          <div class="volume-background"></div>
          <div class="volume-current" :style="{ width: volumePercentage }"></div>
          <div class="volume-handle" :style="{ left: volumePercentage }"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, defineProps, defineExpose, defineEmits } from 'vue';

// Props 
const props = defineProps({
  currentTrack: {
    type: Object,
    default: null
  },
  isPlaying: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['toggle-play', 'next-track', 'previous-track', 'set-volume']);

// State variables
const currentPosition = ref(0);
const trackDuration = ref(0);
const isShuffleOn = ref(false);
const repeatState = ref('off'); // 'off', 'context', 'track'
const volume = ref(50);
const previousVolume = ref(50); // Store previous volume for mute/unmute
const progressInterval = ref(null);

// Computed properties
const artistNames = computed(() => {
  if (!props.currentTrack || !props.currentTrack.artists) return '';
  return props.currentTrack.artists.map(artist => artist.name).join(', ');
});

const progressPercentage = computed(() => {
  if (!trackDuration.value) return '0%';
  return `${(currentPosition.value / trackDuration.value) * 100}%`;
});

const volumePercentage = computed(() => {
  return `${volume.value}%`;
});

const volumeIcon = computed(() => {
  if (volume.value === 0) return 'fa-volume-mute';
  if (volume.value < 30) return 'fa-volume-off';
  if (volume.value < 70) return 'fa-volume-down';
  return 'fa-volume-up';
});

// Methods
const formatTime = (ms) => {
  if (!ms) return '0:00';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const startProgressInterval = () => {
  // Clear any existing interval
  if (progressInterval.value) {
    clearInterval(progressInterval.value);
  }
  
  // Update progress every second if playing
  if (props.isPlaying) {
    progressInterval.value = setInterval(() => {
      if (currentPosition.value < trackDuration.value) {
        currentPosition.value += 1000;
      } else {
        clearInterval(progressInterval.value);
      }
    }, 1000);
  }
};

const togglePlay = () => {
  console.log('Toggle play clicked in PlayerBar');
  emit('toggle-play');
};

const nextTrack = () => {
  console.log('Next track clicked in PlayerBar');
  emit('next-track');
};

const previousTrack = () => {
  console.log('Previous track clicked in PlayerBar');
  emit('previous-track');
};

const seekPosition = (event) => {
  console.log('Seek position clicked');
  if (!trackDuration.value) return;
  
  const clickPosition = event.offsetX / event.currentTarget.offsetWidth;
  const positionMs = Math.floor(clickPosition * trackDuration.value);
  
  // Update local state immediately for responsive UI
  currentPosition.value = positionMs;
  
  // Emit event to parent component to handle actual seeking
  emit('seek-position', positionMs);
};

const toggleMute = () => {
  if (volume.value > 0) {
    // Store current volume and mute
    previousVolume.value = volume.value;
    volume.value = 0;
  } else {
    // Restore previous volume
    volume.value = previousVolume.value;
  }
  
  // Emit volume change to parent
  emit('set-volume', volume.value / 100);
};

const adjustVolume = (event) => {
  const clickPosition = event.offsetX / event.currentTarget.offsetWidth;
  const newVolume = Math.max(0, Math.min(100, Math.floor(clickPosition * 100)));
  
  volume.value = newVolume;
  emit('set-volume', newVolume / 100);
};

const shuffle = () => {
  isShuffleOn.value = !isShuffleOn.value;
  // Emit shuffle change event if needed
};

const repeatMode = () => {
  // Rotate through states: off -> context -> track -> off
  if (repeatState.value === 'off') {
    repeatState.value = 'context';
  } else if (repeatState.value === 'context') {
    repeatState.value = 'track';
  } else {
    repeatState.value = 'off';
  }
  
  // Emit repeat mode change event if needed
};

// Update player state from external source (like Spotify SDK)
const updatePlayerState = (state) => {
  if (!state) {
    clearInterval(progressInterval.value);
    return;
  }
  
  // Update position
  currentPosition.value = state.position || 0;
  
  // Update track duration if available
  if (state.track_window?.current_track) {
    trackDuration.value = state.track_window.current_track.duration_ms || 0;
  } else if (props.currentTrack) {
    trackDuration.value = props.currentTrack.duration_ms || 0;
  }
  
  // Update playback settings
  isShuffleOn.value = !!state.shuffle;
  
  // Map repeat mode: 0 = off, 1 = context (repeat playlist/album), 2 = track (repeat song)
  switch(state.repeat_mode) {
    case 0: repeatState.value = 'off'; break;
    case 1: repeatState.value = 'context'; break;
    case 2: repeatState.value = 'track'; break;
    default: repeatState.value = 'off';
  }
  
  startProgressInterval();
};

// Watch for changes in playback state
watch(() => props.isPlaying, (newValue) => {
  console.log('isPlaying changed to:', newValue);
  if (newValue) {
    startProgressInterval();
  } else {
    clearInterval(progressInterval.value);
  }
});

// Watch for track changes
watch(() => props.currentTrack, (newTrack) => {
  if (newTrack) {
    console.log('Current track changed to:', newTrack.name);
    trackDuration.value = newTrack.duration_ms || 0;
    currentPosition.value = 0; // Reset position for new track
    startProgressInterval(); // Restart interval with the new track
  } else {
    // No track playing
    currentPosition.value = 0;
    trackDuration.value = 0;
    clearInterval(progressInterval.value);
  }
});

// Clean up interval when component is unmounted
onUnmounted(() => {
  if (progressInterval.value) {
    clearInterval(progressInterval.value);
  }
});

// Set default volume on mount
onMounted(() => {
  volume.value = 50; // Default to 50%
});

// Expose methods to parent component
defineExpose({
  updatePlayerState
});
</script>

<style scoped>
.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 90px;
  background-color: #181818;
  border-top: 1px solid #282828;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 100;
}

.track-info, .player-controls, .player-options {
  display: flex;
  align-items: center;
}

.track-info {
  width: 30%;
  min-width: 180px;
}

.player-controls {
  width: 40%;
  max-width: 722px;
  flex-direction: column;
}

.player-options {
  width: 30%;
  min-width: 180px;
  justify-content: flex-end;
}

.track-meta {
  display: flex;
  align-items: center;
}

.track-image {
  width: 56px;
  height: 56px;
  margin-right: 8px;
}

.track-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.placeholder-image {
  width: 100%;
  height: 100%;
  background-color: #333;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #b3b3b3;
}

.track-text {
  margin-right: 16px;
  max-width: 140px;
}

.track-title {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: white;
}

.track-artist {
  font-size: 11px;
  color: #b3b3b3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.like-button {
  background: transparent;
  border: none;
  color: #b3b3b3;
  font-size: 16px;
  cursor: pointer;
}

.like-button:hover {
  color: white;
}

.control-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.control-button {
  background: transparent;
  border: none;
  color: #b3b3b3;
  font-size: 16px;
  padding: 8px;
  margin: 0 8px;
  cursor: pointer;
}

.control-button:hover, .control-button.active {
  color: white;
}

.play-pause-button {
  background-color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: black;
  font-size: 14px;
  margin: 0 16px;
  cursor: pointer;
}

.play-pause-button:hover {
  transform: scale(1.05);
}

.progress-container {
  display: flex;
  align-items: center;
  width: 100%;
}

.time {
  font-size: 11px;
  color: #b3b3b3;
  width: 40px;
  text-align: center;
}

.progress-bar {
  flex-grow: 1;
  height: 12px;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin: 0 8px;
}

.progress-background {
  background-color: #535353;
  height: 4px;
  width: 100%;
  position: absolute;
}

.progress-current {
  background-color: #b3b3b3;
  height: 4px;
  position: absolute;
  transition: width 0.1s linear;
}

.progress-bar:hover .progress-current {
  background-color: #1DB954;
}

.progress-handle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: white;
  position: absolute;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.2s;
}

.progress-bar:hover .progress-handle {
  opacity: 1;
}

.option-button {
  background: transparent;
  border: none;
  color: #b3b3b3;
  font-size: 16px;
  padding: 8px;
  margin: 0 8px;
  cursor: pointer;
}

.option-button:hover {
  color: white;
}

.volume-control {
  display: flex;
  align-items: center;
  width: 136px;
}

.volume-control i {
  color: #b3b3b3;
  margin-right: 8px;
  cursor: pointer;
}

.volume-control i:hover {
  color: white;
}

.volume-bar {
  flex-grow: 1;
  height: 12px;
  position: relative;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.volume-background {
  background-color: #535353;
  height: 4px;
  width: 100%;
  position: absolute;
}

.volume-current {
  background-color: #b3b3b3;
  height: 4px;
  position: absolute;
  transition: width 0.1s linear;
}

.volume-control:hover .volume-current {
  background-color: #1DB954;
}

.volume-handle {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: white;
  position: absolute;
  transform: translateX(-50%);
  opacity: 0;
  transition: opacity 0.2s;
}

.volume-control:hover .volume-handle {
  opacity: 1;
}

@media (max-width: 768px) {
  .player-bar {
    flex-direction: column;
    height: auto;
    padding: 8px;
  }
  
  .track-info, .player-controls, .player-options {
    width: 100%;
    margin: 8px 0;
  }
  
  .track-info {
    justify-content: center;
  }
  
  .player-options {
    justify-content: center;
  }
}
</style>