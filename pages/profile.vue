<template>
    <div class="profile-container">
        <NavBar />
        <div v-if="profileData" class="profile-content">
            <div class="profile-header">
                <img 
                    v-if="profileData.images && profileData.images.length" 
                    :src="profileData.images[0].url" 
                    class="profile-image" 
                    alt="Profile Picture"
                />
                <div v-else class="profile-image-placeholder">
                    <span>{{ getInitials(profileData.display_name) }}</span>
                </div>
                <div class="profile-info">
                    <h1>{{ profileData.display_name }}</h1>
                    <p class="profile-email">{{ profileData.email }}</p>
                    <div class="profile-stats">
                        <div class="stat">
                            <span class="stat-value">{{ profileData.followers ? profileData.followers.total : 0 }}</span>
                            <span class="stat-label">Followers</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="profile-details">
                <h2>Account Details</h2>
                <div class="detail-item">
                    <span class="detail-label">Country:</span>
                    <span class="detail-value">{{ profileData.country }}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Product:</span>
                    <span class="detail-value">{{ profileData.product }}</span>
                </div>
            </div>
        </div>
        
        <div v-else-if="error" class="error-container">
            <p>{{ error }}</p>
            <button @click="handleLogin" class="login-button">Login with Spotify</button>
        </div>
        
        <div v-else class="loading-container">
            <p>Loading profile data...</p>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useSpotifyToken } from '../composables/useSpotifyToken';
import { useLoginWithSpotify } from '../composables/useloginusingSpotify';
import NavBar from '../components/NavBar.vue';

const { loginWithSpotify } = useLoginWithSpotify();
const profileData = ref(null);
const error = ref(null);
const loading = ref(true);

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

onMounted(async () => {
    try {
        const token = await useSpotifyToken();
        if (!token) {
            error.value = "Not logged in. Please log in to view your profile.";
            loading.value = false;
            return;
        }
        
        const response = await $fetch('https://api.spotify.com/v1/me', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        
        profileData.value = response;
    } catch (err) {
        console.error('Failed to fetch profile data:', err);
        error.value = "Failed to load profile data. Please try logging in again.";
    } finally {
        loading.value = false;
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
</style>