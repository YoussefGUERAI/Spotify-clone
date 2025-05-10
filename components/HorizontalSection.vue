<template>
    <section class="horizontal-section">
      <h2 class="section-title">{{ title }}</h2>
  
      <ul v-if="items?.length" class="scroll-list">
        <li v-for="item in items" :key="item.id" class="scroll-item">
          <img
            :src="item.images?.[0]?.url"
            class="item-image"
            :alt="item.name"
          />
          <div class="item-details">
            <h3 class="item-name">{{ item.name }}</h3>
            <p v-if="item.artists" class="item-sub">{{ item.artists[0]?.name }}</p>
          </div>
        </li>
      </ul>
  
      <p v-else class="loading">Loading or empty</p>
    </section>
  </template>
  
  <script setup>
  defineProps({
    title: String,
    items: Array,
  })
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
}

.item-image {
  width: 160px;
  height: 160px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  color: #fff;
}

.item-sub {
  font-size: 12px;
  color: #b3b3b3;
}

.loading {
  color: #888;
}

  </style>
  