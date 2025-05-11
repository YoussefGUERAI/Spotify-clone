import { defineEventHandler } from 'h3';
import { useRuntimeConfig } from "#imports";

export default defineEventHandler(async (event) => {
  const { code } = await readBody(event);

  if (!code) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Code is required',
    });
  }

  const config = useRuntimeConfig();
  const clientId = '68732cdb5277475c994556a35a7aaca5';
  const clientSecret = '0b8c1fa18a0441a8ad236e0e2e76e77f';

  const params = new URLSearchParams();
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', 'http://127.0.0.1:3000/callback');

  const credentials = btoa(`${clientId}:${clientSecret}`);

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${credentials}`,
    },
    body: params,
  });

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: 'Failed to fetch token from Spotify',
    });
  }

  const data = await response.json();
  return data;
});