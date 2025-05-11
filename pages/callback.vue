<template>
  <div class="callback-container">
    <p>Chargement...</p>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { onMounted } from "vue";
import { useAuth } from "~/composables/useAuth";

const router = useRouter();
const { saveAuthData } = useAuth();

onMounted(async () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state = params.get("state");
  const storedState = localStorage.getItem("spotify_auth_state");

  // Verify state to prevent CSRF attacks
  if (!state || state !== storedState) {
    console.error("Invalid state parameter");
    router.push("/");
    return;
  }

  // Clear the stored state
  localStorage.removeItem("spotify_auth_state");

  if (!code) {
    console.error("Code d'autorisation manquant dans l'URL.");
    router.push("/");
    return;
  }

  try {
    // Exchange code for access token using our server endpoint
    const response = await fetch("/api/spotify/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Échec de la récupération du token : ${error}`);
    }

    const tokenData = await response.json();

    // Fetch user profile with the new access token
    const profileResponse = await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      const error = await profileResponse.text();
      throw new Error(`Échec de la récupération du profil : ${error}`);
    }

    const profile = await profileResponse.json();

    // Save both token and profile data using our auth composable
    saveAuthData(tokenData, profile);

    // Redirect to the home page
    router.push("/");
  } catch (error) {
    console.error("Une erreur s'est produite :", error);
    router.push("/");
  }
});
</script>

<style scoped>
.callback-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #121212;
  color: white;
  font-size: 1.2rem;
}
</style>
