<template>
    <div class="profile-container">
        <NavBar />
        <div v-if="authState.profile" class="profile-content">
            <div class="profile-header">
                <img 
                    v-if="authState.profile.images && authState.profile.images.length" 
                    :src="authState.profile.images[0].url" 
                    class="profile-image" 
                    alt="Profile Picture"
                />
                <div v-else class="profile-image-placeholder">
                    <span>{{ getInitials(authState.profile.display_name) }}</span>
                </div>
                <div class="profile-info">
                    <h1>{{ authState.profile.display_name }}</h1>
                    <p class="profile-email">{{ authState.profile.email }}</p>
                    <div class="profile-stats">
                        <div class="stat">
                            <span class="stat-value">{{ authState.profile.followers ? authState.profile.followers.total : 0 }}</span>
                            <span class="stat-label">Followers</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="profile-details">
                <h2>Account Details</h2>
                <div class="detail-item">
                    <span class="detail-label">Country:</span>
                    <span class="detail-value">{{ authState.profile.country }}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Product:</span>
                    <span class="detail-value">{{ authState.profile.product }}</span>
                </div>
            </div>
            
            <!-- Playlists Section -->
            <div class="playlists-section">
                <div v-if="loadingPlaylists" class="playlists-loading">
                    <p>Loading your playlists...</p>
                </div>
                
                <div v-else-if="playlistsError" class="playlists-error">
                    <p>{{ playlistsError }}</p>
                    <button @click="fetchPlaylists" class="retry-button">Retry</button>
                </div>
                
                <PlaylistGrid 
                    v-else-if="userPlaylists && userPlaylists.length"
                    title="Your Playlists" 
                    :playlists="userPlaylists"
                    :loading="loadingMorePlaylists"
                    :nextPage="hasMorePlaylists"
                    :showLoadMore="true"
                    @loadMore="loadMorePlaylists"
                />
                
                <div v-else-if="userPlaylists && userPlaylists.length === 0" class="no-playlists">
                    <p>You don't have any playlists yet.</p>
                </div>
            </div>
        </div>
        
        <div v-else-if="!isAuthenticated" class="error-container">
            <p>You need to log in to view your profile</p>
            <button @click="handleLogin" class="login-button">Login with Spotify</button>
        </div>
        
        <div v-else class="loading-container">
            <p>Loading profile data...</p>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useLoginWithSpotify } from '../composables/useloginusingSpotify';
import { useAuth } from '../composables/useAuth';
import NavBar from '../components/NavBar.vue';
import PlaylistGrid from '../components/PlaylistGrid.vue';

const { loginWithSpotify } = useLoginWithSpotify();
const { state: authState, isAuthenticated, fetchUserPlaylists, fetchMorePlaylists } = useAuth();

const loadingPlaylists = ref(false);
const loadingMorePlaylists = ref(false);
const playlistsError = ref(null);

// Computed property to get playlists from auth state
const userPlaylists = computed(() => {
    return authState.playlists?.items || [];
});

// Check if there are more playlists to load
const hasMorePlaylists = computed(() => {
    return !!authState.playlists?.next;
});

const handleLogin = () => {
    loginWithSpotify();
};

const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .substring(0, 2);
};

// Fetch user playlists
const fetchPlaylists = async () => {
    if (!isAuthenticated.value) return;
    
    loadingPlaylists.value = true;
    playlistsError.value = null;
    
    try {
        await fetchUserPlaylists();
    } catch (error) {
        console.error('Error fetching playlists:', error);
        playlistsError.value = 'Failed to load your playlists. Please try again later.';
    } finally {
        loadingPlaylists.value = false;
    }
};

// Load more playlists when the user clicks "Load More"
const loadMorePlaylists = async () => {
    if (loadingMorePlaylists.value || !hasMorePlaylists.value) return;
    
    loadingMorePlaylists.value = true;
    
    try {
        await fetchMorePlaylists();
    } catch (error) {
        console.error('Error loading more playlists:', error);
    } finally {
        loadingMorePlaylists.value = false;
    }
};

// Fetch playlists when the component mounts
onMounted(() => {
    if (isAuthenticated.value) {
        fetchPlaylists();
    }
});
</script>

<style scoped>
.profile-container {
    background-color: #121212;
    color: #ffffff;
    min-height: 100vh;
}

.profile-content {
    padding: 40px;
    max-width: 1200px;
    margin: 0 auto;
}

.profile-header {
    display: flex;
    align-items: center;
    margin-bottom: 40px;
}

.profile-image {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 30px;
    box-shadow: 0 4px 60px rgba(0, 0, 0, 0.5);
}

.profile-image-placeholder {
    width: 180px;
    height: 180px;
    border-radius: 50%;
    background-color: #282828;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 30px;
    font-size: 60px;
    color: #1DB954;
}

.profile-info h1 {
    font-size: 3rem;
    margin-bottom: 10px;
}

.profile-email {
    color: #b3b3b3;
    margin-bottom: 20px;
}

.profile-stats {
    display: flex;
    gap: 30px;
}

.stat {
    display: flex;
    flex-direction: column;
}

.stat-value {
    font-size: 24px;
    font-weight: bold;
}

.stat-label {
    color: #b3b3b3;
}

.profile-details {
    background-color: #181818;
    padding: 30px;
    border-radius: 8px;
    margin-top: 20px;
}

.profile-details h2 {
    margin-bottom: 20px;
}

.detail-item {
    display: flex;
    margin-bottom: 15px;
}

.detail-label {
    width: 120px;
    color: #b3b3b3;
}

.detail-value {
    font-weight: 500;
}

.error-container {
    padding: 40px;
    text-align: center;
}

.loading-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 400px;
}

.login-button {
    background: #1DB954;
    color: white;
    border: none;
    border-radius: 30px;
    padding: 12px 30px;
    font-weight: bold;
    margin-top: 20px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.login-button:hover {
    background: #1ed760;
}

.playlists-section {
    margin-top: 40px;
}

.playlists-loading, .playlists-error, .no-playlists {
    text-align: center;
    padding: 40px 0;
    color: #b3b3b3;
}

.playlists-error {
    color: #ff5252;
}

.retry-button {
    background: #1DB954;
    color: white;
    border: none;
    border-radius: 30px;
    padding: 10px 20px;
    font-weight: bold;
    margin-top: 15px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.retry-button:hover {
    background: #1ed760;
}
</style>