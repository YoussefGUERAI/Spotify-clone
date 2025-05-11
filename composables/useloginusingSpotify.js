// composables/useLoginWithSpotify.js

export const useLoginWithSpotify = () => {
  const loginWithSpotify = () => {
    const clientId = '68732cdb5277475c994556a35a7aaca5';
    const redirectUri = 'http://127.0.0.1:3000/callback';
    const scopes = [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'playlist-modify-public',
      'playlist-modify-private',
      'user-library-read',
      'user-top-read',
      'user-follow-read',
      // Add missing scopes for playback control
      'streaming',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'app-remote-control'
    ];

    // Generate a random state for CSRF protection
    const generateRandomString = (length) => {
      const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let text = '';
      for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    };
    
    const state = generateRandomString(16);
    localStorage.setItem('spotify_auth_state', state);

    // Using authorization code flow with 'response_type=code' instead of token
    const authUrl = new URL('https://accounts.spotify.com/authorize');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('scope', scopes.join(' '));
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('show_dialog', 'true');

    window.location.href = authUrl.toString();
  }
  return { loginWithSpotify };
};
