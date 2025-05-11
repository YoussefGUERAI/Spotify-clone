import { defineEventHandler, readBody, createError } from 'h3';
import { useRuntimeConfig } from "#imports";

export default defineEventHandler(async (event) => {
  const { refresh_token } = await readBody(event);

  if (!refresh_token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Refresh token is required',
    });
  }

  const clientId = '68732cdb5277475c994556a35a7aaca5';
  const clientSecret = '0b8c1fa18a0441a8ad236e0e2e76e77f';

  const params = new URLSearchParams();
  params.append('grant_type', 'refresh_token');
  params.append('refresh_token', refresh_token);

  const credentials = btoa(`${clientId}:${clientSecret}`);

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: params,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Token refresh failed:', errorData);
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to refresh token from Spotify',
      });
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to refresh token: ' + error.message,
    });
  }
});