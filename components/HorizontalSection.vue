<template>
    <section class="horizontal-section">
      <h2 class="section-title">{{ title }}</h2>
  
      <ul v-if="items?.length" class="scroll-list">
        <li v-for="item in items" :key="item.id" class="scroll-item">
          <div class="item-cover" @click="navigateToItem(item)">
            <img
              :src="item.images?.[0]?.url"
              class="item-image"
              :alt="item.name"
            />
            <div class="play-overlay">
              <button class="play-button" @click.stop="playItem(item)">
                <i :class="isItemPlaying(item) ? 'fas fa-pause' : 'fas fa-play'"></i>
              </button>
            </div>
          </div>
          <div class="item-details" @click="navigateToItem(item)">
            <h3 class="item-name">{{ item.name }}</h3>
            <p v-if="item.artists" class="item-sub">{{ item.artists[0]?.name }}</p>
          </div>
        </li>
      </ul>
  
      <p v-else class="loading">Loading or empty</p>
    </section>
  </template>
  
  <script setup>
  import { defineProps, defineEmits } from 'vue';
  import { useRouter } from 'vue-router';

  const router = useRouter();
  
  const props = defineProps({
    title: String,
    items: Array,
    currentlyPlaying: {
      type: Object,
      default: null
    }
  });

  const emit = defineEmits(['play']);

  const playItem = (item) => {
    // Determine the URI based on the item type
    let uri;
    
    // Handle different item types
    if (item.type === 'album' || item.album_type) {
      uri = `spotify:album:${item.id}`;
    } else if (item.type === 'playlist') {
      uri = `spotify:playlist:${item.id}`;
    } else if (item.type === 'track') {
      uri = `spotify:track:${item.id}`;
    }
    
    if (uri) {
      emit('play', { item, uri });
    }
  };

  const navigateToItem = (item) => {
    // Navigate based on item type
    if (item.type === 'album' || item.album_type) {
      router.push(`/album/${item.id}`);
    } else if (item.type === 'playlist') {
      router.push(`/playlist/${item.id}`);
    } else if (item.type === 'track') {
      // Tracks don't have dedicated pages, so just play them
      playItem(item);
    }
  };

  const isItemPlaying = (item) => {
    if (!props.currentlyPlaying) return false;
    
    // Compare based on ID
    return item.id === props.currentlyPlaying.id;
  };
  </script>
  
  <style scoped>
  .horizontal-section {
    background-color: #000;
    padding: 20px;
    margin-bottom: 30px;
    border-radius: 10px;
  }

  .section-title {
    font-size: 24px;
    margin-bottom: 15px;
    color: #fff;
  }

  .scroll-list {
    display: flex;
    overflow-x: auto;
    gap: 20px;
    padding: 10px 0;
    list-style: none;
    scroll-behavior: smooth;
  }

  .scroll-item {
    flex: 0 0 auto;
    width: 160px;
    color: #fff;
    text-align: center;
    cursor: pointer;
    transition: transform 0.2s ease;
  }

  .scroll-item:hover {
    transform: scale(1.05);
  }

  .item-cover {
    position: relative;
    width: 160px;
    height: 160px;
    margin-bottom: 10px;
    overflow: hidden;
  }

  .item-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 8px;
  }

  .play-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.2s ease;
    border-radius: 8px;
  }

  .scroll-item:hover .play-overlay {
    opacity: 1;
  }

  .play-button {
    background-color: #1DB954;
    border: none;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
    cursor: pointer;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
  }

  .play-button:hover {
    transform: scale(1.1);
    background-color: #1ed760;
  }

  .item-name {
    font-size: 14px;
    font-weight: 600;
    color: #fff;
    margin: 8px 0 4px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .item-sub {
    font-size: 12px;
    color: #b3b3b3;
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .loading {
    color: #888;
  }
  </style>
