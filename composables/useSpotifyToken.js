// composables/useSpotifyToken.js
export async function useSpotifyToken() {
  const clientId = '68732cdb5277475c994556a35a7aaca5';
  const clientSecret = '0b8c1fa18a0441a8ad236e0e2e76e77f';
  const basic = btoa(`${clientId}:${clientSecret}`);
  try{
    const response = await $fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  return response.access_token;
  }catch(error){
    console.error(error);
    return null;
  }
  
}
