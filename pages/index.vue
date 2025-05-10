<script setup>
import { ref, onMounted } from 'vue';
import Navbar from '../components/NavBar.vue';
import HorizontalSection from '../components/HorizontalSection.vue';
import { useSpotifyToken } from '../composables/useSpotifyToken';

let releases = ref(null);
let featuredPlaylists = ref(null);

const fetchNewReleases = async() => {
  try {
    const token = await useSpotifyToken();
    if (!token) {
      console.log('No token available');
      return;
    }
    const url = 'https://api.spotify.com/v1/browse/new-releases?country=US';

    const response = await $fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    releases.value = response;
  } catch (err) {
    console.error('Spotify fetch failed:', err.data || err);
  }
};

const fetchFeaturedPlaylists = async() => {
  try {
    const token = await useSpotifyToken();
    if (!token) {
      console.log('No token available');
      return;
    }
    const url = 'https://api.spotify.com/v1/browse/featured-playlists';
    const response = await $fetch(url , { 
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    featuredPlaylists.value = response;
  } catch (err) {
    console.error('Spotify fetch failed:', err.data || err);
  }
};

// Call the fetch functions when the component is mounted
onMounted(() => {
  fetchNewReleases();
  fetchFeaturedPlaylists();
});
</script>

<template>
  <div class="spotify-home">
    <Navbar />
    <HorizontalSection
      title="New Releases"
      :items="releases?.albums?.items"/>
    <HorizontalSection
      title="Featured Playlists"
      :items="featuredPlaylists?.playlists?.items"/>
  </div>
</template>

<style scoped>
.spotify-home {
  background-color: #121212;
  color: #fff;
  min-height: 100vh;
  padding-bottom: 40px;
}

.spotify-albums {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  background-color: #000;
  color: #fff;
  padding: 20px;
}

.spotify-title {
  font-size: 24px;
  margin-bottom: 20px;
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

