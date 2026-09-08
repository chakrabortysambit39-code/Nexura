# Spotify integration in NEXURA

NEXURA uses Spotify's official embedded player for supported public Spotify content. No Spotify secret belongs in the frontend.

## How to use

1. Open NEXURA and click Spotify.
2. Paste an official Spotify URL for a track, album, playlist, artist, show, or episode when supported.
3. NEXURA converts the URL to Spotify's embed form and loads the official player.

## Optional Spotify Developer API

A Spotify Developer Client ID/Secret is only needed if NEXURA later adds its own Spotify Web API search, user-library, or account authorization features. Never expose the Client Secret in Vite `VITE_*` variables; keep it server-side.
