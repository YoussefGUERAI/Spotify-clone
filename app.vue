<template>
  <head>
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
    />
  </head>
  <div class="app-container">
    <NuxtPage/>
  </div>
</template>

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
}

* {
  box-sizing: border-box;
}
</style>
