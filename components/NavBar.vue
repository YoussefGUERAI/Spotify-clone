<template>
    <nav class="navbar">
        <div class="navbar-left">
            <img src="/Users/mac/spotify-clone/assets/Spotify-Icon-Logo.wine.png" class="logo" />
            <div class="nav-icons">
                <button class="icon-button" @click="navigateToHome"><i class="fas fa-home"></i></button>
            </div>
        </div>
  
        <div class="search-box" ref="searchBoxRef">
            <i class="fas fa-search"></i>
            <input 
                type="text" 
                placeholder="What do you want to play?"
                v-model="searchQuery"
                @input="handleSearch"
                @focus="showSearchResults = true"
            />
            <button v-if="searchQuery" class="clear-search-btn" @click="clearSearch">
                <i class="fas fa-times"></i>
            </button>
            
            <!-- Search results dropdown -->
            <SearchResults 
                v-if="showSearchResults && searchResults && searchQuery" 
                :results="searchResults" 
                :searchQuery="searchQuery"
                :onClose="() => showSearchResults = false"
            />
        </div>
  
        <div class="nav-actions">
            <div class="action-item">
                <i class="fas fa-download"></i>
                <span>Install App</span>
            </div>
            <i class="fas fa-bell notification-icon"></i>
            
            <!-- Updated authentication-based UI -->
            <button v-if="!isAuthenticated" @click="handleLogin" class="login-button">Login</button>
            <button v-else @click="handleLogout" class="logout-button">Logout</button>
            
            
            <!-- Show user avatar if available -->
            <img 
                v-if="authState.profile && authState.profile.images && authState.profile.images[0]"
                :src="authState.profile.images[0].url" 
                class="avatar" 
                @click="navigateToProfile" 
                :alt="authState.profile.display_name"
            />
            <div 
                v-else-if="isAuthenticated && authState.profile"
                class="avatar avatar-placeholder"
                @click="navigateToProfile"
            >
                {{ getInitials(authState.profile.display_name) }}
            </div>
            <img 
                v-else
                src="/Users/mac/spotify-clone/assets/386c5283f14bdca0fa14e28dd18fb574.png" 
                class="avatar" 
                @click="navigateToProfile" 
            />
        </div>
    </nav>
</template>
  
<script setup>
import { useLoginWithSpotify } from '../composables/useloginusingSpotify';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { useSearch } from '../composables/useSearch';
import { ref, onMounted, onUnmounted } from 'vue';
import SearchResults from './SearchResults.vue';

const { loginWithSpotify } = useLoginWithSpotify();
const router = useRouter();
const { state: authState, logout, isAuthenticated } = useAuth();
const { search, clearSearch: resetSearch, searchResults } = useSearch();

const searchQuery = ref('');
const showSearchResults = ref(false);
const searchBoxRef = ref(null);
const searchDebounceTimer = ref(null);

// Debounced search function to prevent too many API calls
const handleSearch = () => {
  // Clear previous timer
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value);
  }
  
  // Set new timer (300ms debounce)
  searchDebounceTimer.value = setTimeout(async () => {
    if (searchQuery.value.trim()) {
      await search(searchQuery.value, ['track', 'album', 'artist']);
      showSearchResults.value = true;
    } else {
      resetSearch();
      showSearchResults.value = false;
    }
  }, 300);
};

// Clear search input and results
const clearSearch = () => {
  searchQuery.value = '';
  resetSearch();
  showSearchResults.value = false;
};

// Handle clicks outside the search box to close results
const handleClickOutside = (event) => {
  if (searchBoxRef.value && !searchBoxRef.value.contains(event.target)) {
    showSearchResults.value = false;
  }
};

// Get user initials for avatar placeholder
const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

const handleLogin = () => {
  loginWithSpotify();
};

const handleLogout = () => {
  logout();
  router.push('/');
};

const navigateToProfile = () => {
  router.push('/profile');
};

const navigateToHome = () => {
  router.push('/');
};

// Setup and cleanup click outside listener
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  if (searchDebounceTimer.value) {
    clearTimeout(searchDebounceTimer.value);
  }
});
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
    position: relative;
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

.clear-search-btn {
    background: transparent;
    border: none;
    color: gray;
    cursor: pointer;
    padding: 5px;
}

.clear-search-btn:hover {
    color: white;
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

.logout-button {
    background: #db1010;
    color: white;
    border: none;
    border-radius: 20px;
    padding: 8px 16px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s;
}
.logout-button:hover {
    background: #db1010;
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

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #282828;
  font-weight: bold;
  color: white;
  font-size: 12px;
}
</style>
