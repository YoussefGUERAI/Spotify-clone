// composables/useLoginWithSpotify.js

export const useLoginWithSpotify = () => {
  const loginWithSpotify = () => {
    const clientId = '68732cdb5277475c994556a35a7aaca5';
    const redirectUri = 'http://localhost:3000/';
    const scopes = [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'playlist-modify-public',
      'playlist-modify-private'
    ];

    const authUrl = `https://accounts.spotify.com/authorize?response_type=token&client_id=${clientId}&scope=${scopes.join(
      '%20'
    )}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    window.location.href = authUrl;
  }
  return { loginWithSpotify };
};
