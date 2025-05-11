<template>
  <head>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
    />
  </head>
  <div class="app-container">
    <NuxtPage :current-track="currentTrack" @play="handlePlay"/>
    <PlayerBar 
      ref="playerBarRef" 
      :is-playing="isPlaying"
      :current-track="currentTrack"
      @toggle-play="togglePlay"
      @next-track="nextTrack"
      @previous-track="previousTrack"
      @set-volume="setVolume"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useAuth } from './composables/useAuth';
import { usePlayer } from './composables/usePlayer';
import PlayerBar from './components/PlayerBar.vue';

const { isAuthenticated } = useAuth();
const player = usePlayer();
const playerBarRef = ref(null);
const currentTrack = ref(null);
const isPlaying = computed(() => player.isPlaying.value);

// Initialize the player when user is authenticated
watch(isAuthenticated, async (isAuth) => {
  if (isAuth && process.client) {
    console.log('User authenticated, initializing player');
    await initializePlayer();
  }
});

// Initialize player when component mounts if user is already authenticated
onMounted(async () => {
  if (isAuthenticated.value && process.client) {
    console.log('Component mounted and user authenticated, initializing player');
    await initializePlayer();
  }
});

// Initialize Spotify Web Player
const initializePlayer = async () => {
  try {
    console.log('Initializing Spotify Web Player...');
    const spotifyPlayer = await player.initializePlayer();
    
    // Wait for player to be ready
    if (spotifyPlayer) {
      // Add a listener to track state changes
      spotifyPlayer.addListener('player_state_changed', handlePlayerStateChange);
      console.log('Added player state change listener');
    }
  } catch (error) {
    console.error('Error initializing player:', error);
  }
};

// Handle play requests from components
const handlePlay = async ({ item, uri, toggle = false }) => {
  console.log('Play requested:', { item, uri, toggle });
  
  if (!player.isReady.value) {
    console.warn('Player not ready yet');
    return;
  }

  try {
    if (toggle) {
      // Toggle play/pause state
      await player.togglePlay();
    } else {
      // Update UI immediately for better UX
      if (item && item.type === 'track') {
        currentTrack.value = item;
      }
      
      // Start playback
      await player.play(uri);
    }
  } catch (error) {
    console.error('Error handling play request:', error);
  }
};

// Handle player state changes
const handlePlayerStateChange = (state) => {
  if (!state) {
    console.log('Player state cleared');
    currentTrack.value = null;
    return;
  }

  console.log('Player state changed');
  
  // Update current track based on player state
  if (state.track_window?.current_track) {
    const track = state.track_window.current_track;
    
    currentTrack.value = {
      id: track.id,
      name: track.name,
      type: 'track',
      uri: track.uri,
      artists: track.artists,
      album: {
        id: track.album.uri.split(':').pop(),
        name: track.album.name,
        images: [{ url: track.album.images[0]?.url }]
      },
      duration_ms: track.duration_ms
    };
    
    console.log('Current track updated:', currentTrack.value.name);
  }
  
  // Update UI in PlayerBar
  if (playerBarRef.value) {
    playerBarRef.value.updatePlayerState(state);
  }
};

// Player controls
const togglePlay = async () => {
  console.log('Toggle play/pause requested');
  await player.togglePlay();
};

const nextTrack = async () => {
  console.log('Next track requested');
  await player.nextTrack();
};

const previousTrack = async () => {
  console.log('Previous track requested');
  await player.previousTrack();
};

const setVolume = async (level) => {
  console.log('Setting volume to:', level);
  await player.setVolume(level);
};
</script>

<style>
/* Global styles to reset defaults and set black background */
html, body {
  margin: 0;
  padding: 0;
  background-color: #000000;
  color: white;
  font-family: 'Helvetica Neue', Arial, sans-serif;
  height: 100%;
  width: 100%;
  overflow-x: hidden;
}

body {
  min-height: 100vh;
}

#__nuxt {
  min-height: 100vh;
  background-color: #000000;
}

.app-container {
  min-height: 100vh;
  background-color: #000000;
  padding-bottom: 90px; /* Space for the player bar */
}

* {
  box-sizing: border-box;
}
</style>
