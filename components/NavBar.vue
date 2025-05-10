<template>
    <nav class="navbar">
        <div class="navbar-left">
            <img src="/Users/mac/spotify-clone/assets/Spotify-Icon-Logo.wine.png" class="logo" />
            <div class="nav-icons">
                <button class="icon-button"><i class="fas fa-home"></i></button>
            </div>
        </div>
  
        <div class="search-box">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="What do you want to play?" />
            <i class="fas fa-box"></i>
        </div>
  
        <div class="nav-actions">
            <div class="action-item">
                <i class="fas fa-download"></i>
                <span>Install App</span>
            </div>
            <i class="fas fa-bell notification-icon"></i>
            <button @click="handleLogin" class="login-button">Login</button>
            <NuxtLink to="/profile" class="profile-link">
                <i class="fas fa-user"></i>
                <span>Profile</span>
            </NuxtLink>
            <img src="/Users/mac/spotify-clone/assets/386c5283f14bdca0fa14e28dd18fb574.png" class="avatar" @click="navigateToProfile" />
        </div>
    </nav>
</template>
  
<script setup>
import { useLoginWithSpotify } from '../composables/useloginusingSpotify';
import { useRouter } from 'vue-router';

const { loginWithSpotify } = useLoginWithSpotify();
const router = useRouter();

const handleLogin = () => {
  loginWithSpotify();
};

const navigateToProfile = () => {
  router.push('/profile');
};

const navigateToHome = () => {
  router.push('/');
};
</script>

<style scoped>
.navbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: black;
    color: white;
    padding: 12px 24px;
    gap: 16px;
    border-bottom: 1px solid #282828;
}

.navbar-left {
    display: flex;
    align-items: center;
    gap: 16px;
}
  
.logo {
    width: 70px;
    height: auto;
}
  
.icon-button {
    background: #1c1c1c;
    border-radius: 50%;
    padding: 10px;
    border: none;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.icon-button:hover {
    background: #282828;
    transform: scale(1.05);
}
  
.search-box {
    display: flex;
    align-items: center;
    background: #1c1c1c;
    border-radius: 30px;
    padding: 0 15px;
    flex: 1;
    max-width: 380px;
    height: 36px;
    color: gray;
}
  
.search-box input {
    background: transparent;
    border: none;
    outline: none;
    color: white;
    margin: 0 10px;
    flex: 1;
}
  
.nav-actions {
    display: flex;
    align-items: center;
    gap: 20px;
}

.action-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.9rem;
    white-space: nowrap;
}

.notification-icon {
    cursor: pointer;
}
  
.avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.2s;
}

.avatar:hover {
    transform: scale(1.1);
}
  
.login-button {
    background: #1DB954;
    color: white;
    border: none;
    border-radius: 20px;
    padding: 8px 16px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s;
}
  
.login-button:hover {
    background: #1ed760;
    transform: scale(1.03);
}

.profile-link {
    display: flex;
    align-items: center;
    gap: 5px;
    color: white;
    text-decoration: none;
    padding: 8px 16px;
    border-radius: 20px;
    transition: background-color 0.3s;
}
  
.profile-link:hover {
    background-color: #282828;
}
</style>
