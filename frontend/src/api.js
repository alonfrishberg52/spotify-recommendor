const API_BASE_URL = 'http://127.0.0.1:5000/spotify';
import axios from 'axios';

/**
 * Exchange Authorization Code for Access Token
 * @param {string} authCode - The authorization code received from Spotify
 * @returns {Promise<object>} - Response containing access_token, refresh_token, etc.
 */
export const exchangeCodeForToken = async (authCode) => {
    try {
        const response = await fetch(`${API_BASE_URL}/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: authCode }),
        });

        if (!response.ok) {
            throw new Error(`Error exchanging auth code: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Access Token Response:', data); // Debugging
        return data; // Contains access_token, refresh_token, etc.
    } catch (error) {
        console.error('Error exchanging authorization code:', error);
        throw error;
    }
};



/**
 * Refresh Access Token
 * @returns {Promise<string|null>} - Returns the new access token or null if refresh fails.
 */
export const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return null;

    try {
        const response = await fetch('http://127.0.0.1:5000/spotify/refresh_token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!response.ok) {
            console.error('Failed to refresh token');
            return null;
        }

        const data = await response.json();
        console.log('New Access Token:', data.access_token);

        // Store the new access token
        localStorage.setItem('access_token', data.access_token);
        return data.access_token;
    } catch (error) {
        console.error('Error refreshing access token:', error);
        return null;
    }
};


const fetchWithAuth = async (url, options = {}) => {
    let token = localStorage.getItem('access_token');
    if (!token) {
        throw new Error('Access token is missing.');
    }

    // Add Authorization header
    options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
    };

    let response = await fetch(url, options);

    if (response.status === 401) {
        console.warn('Access token expired. Attempting to refresh...');
        const newToken = await refreshAccessToken();

        if (newToken) {
            options.headers.Authorization = `Bearer ${newToken}`;
            response = await fetch(url, options); // Retry the request with new token
        } else {
            throw new Error('Failed to refresh access token. Please log in again.');
        }
    }

    // Handle 404 errors specifically
    if (response.status === 404) {
        console.error(`Resource not found at ${url}. Please check the endpoint.`);
        throw new Error(`Error 404: Resource not found at ${url}.`);
    }

    return response;
};


/**
 * Fetch Top Tracks
 */
export const fetchTopTracks = async () => {
    try {
        const response = await fetchWithAuth('https://api.spotify.com/v1/me/top/tracks', {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Error fetching top tracks: ${response.status}`);
        }

        const data = await response.json();
        return data.items; // Array of tracks
    } catch (error) {
        console.error('Error fetching top tracks:', error);
        throw error;
    }
};

/**
 * Fetch AI Recommendations
 */
export const fetchRecommendations = async (topTracks) => {
    try {
        const response = await fetchWithAuth('http://127.0.0.1:5000/api/recommend', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tracks: topTracks }),
        });

        if (!response.ok) {
            throw new Error(`Error fetching recommendations: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching recommendations:', error);
        throw error;
    }
};
export const redirectToSpotifyLogin = () => {
    console.log('Redirecting to Spotify Login...');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');

    const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_SPOTIFY_REDIRECT_URI || 'http://localhost:3000/callback';
    const scopes = [
        'user-top-read',
        'user-read-private',
        'playlist-read-private',
        'user-read-recently-played',
    ].join(' ');

    const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
        redirectUri
    )}&scope=${encodeURIComponent(scopes)}`;
    window.location.href = authUrl;
};

export const fetchPodcasts = async (interests) => {
    try {
        const response = await fetchWithAuth(
            `${API_BASE_URL}/api/podcasts`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ interests }), // Pass the array directly
                credentials: 'include', // Include credentials (cookies or headers)
            }
        );

        if (!response.ok) {
            throw new Error(`Error fetching podcasts: ${response.status}`);
        }

        const data = await response.json();
        return data.podcasts;
    } catch (error) {
        console.error('Error fetching podcasts:', error);
        throw new Error('Failed to fetch podcast recommendations.');
    }
};

/**
 * Fetch Weekly Music Insights (Top Artists and Genres)
 */
export const fetchWeeklyInsights = async () => {
    try {
        const response = await fetchWithAuth('https://api.spotify.com/v1/me/top/artists?time_range=short_term', {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Error fetching weekly insights: ${response.status}`);
        }

        const data = await response.json();
        const insights = {
            topArtists: data.items.map((artist) => ({
                name: artist.name,
                genres: artist.genres,
                image: artist.images[0]?.url,
                popularity: artist.popularity,
            })),
            topGenres: [...new Set(data.items.flatMap((artist) => artist.genres))], // Unique genres
        };

        return insights;
    } catch (error) {
        console.error('Error fetching weekly insights:', error);
        throw error;
    }
};

/**
 * Fetch Available Genres
 */
export const fetchAvailableGenres = async () => {
    try {
        const response = await fetchWithAuth('https://api.spotify.com/v1/recommendations/available-genre-seeds', {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Error fetching available genres: ${response.status}`);
        }

        const data = await response.json();
        return data.genres; // List of available genres
    } catch (error) {
        console.error('Error fetching available genres:', error);
        throw error;
    }
};

/**
 * Fetch Recommendations Based on Genres
 */
export const fetchRecommendationsByGenre = async (genres) => {
    try {
        const response = await fetchWithAuth(`https://api.spotify.com/v1/recommendations?seed_genres=${genres.join(',')}&limit=20`, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Error fetching recommendations by genre: ${response.status}`);
        }

        const data = await response.json();
        return data.tracks; // List of recommended tracks
    } catch (error) {
        console.error('Error fetching recommendations by genre:', error);
        throw error;
    }
};