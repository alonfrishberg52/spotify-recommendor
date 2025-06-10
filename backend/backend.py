import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import json
import openai

# Initialize Flask app and CORS
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# Load environment variables
load_dotenv()
SPOTIFY_CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
SPOTIFY_CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")
REDIRECT_URI = os.getenv("REDIRECT_URI")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Configure OpenAI
openai.api_key = OPENAI_API_KEY

# Store Spotify access token (in production, use a database or secure storage)
SPOTIFY_TOKEN = {"access_token": None, "refresh_token": None}


def get_spotify_access_token():
    """
    Fetch or refresh Spotify access token. 
    This function checks if the access token is available and if not, it raises an error.
    If the access token is available, it returns the access token.
    This function is used to get the access token for the Spotify API.
    This function is used to get the access token for the Spotify API.
    """
    if not SPOTIFY_TOKEN.get("access_token"):
        raise ValueError("Spotify access token not available")

    return SPOTIFY_TOKEN["access_token"]



def search_spotify_podcasts(query):
    """
    Search Spotify for podcasts (shows) based on query.
    """
    token = get_spotify_access_token()
    url = f"https://api.spotify.com/v1/search?q={query}&type=show&limit=5"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        print(f"Spotify API Error: {response.json()}")
        return []

    results = response.json()
    shows = results.get("shows", {}).get("items", [])
    return shows


@app.route('/api/podcasts', methods=['POST'])
def recommend_podcasts():
    """
    Recommend podcasts based on user interests.
    """
    if request.method == 'OPTIONS':
        return '', 200  # Preflight request success
    data = request.json
    interests = data.get("interests")

    if not interests or not isinstance(interests, list):
        return jsonify({"error": "Interests must be a list of strings."}), 400

    query = ", ".join(interests)
    prompt = f"""
    Based on the following user interests: {query}, provide:
    - Five relevant podcast topics.
    - Each podcast topic must include a concise title and description.
    """

    try:
        # Call OpenAI for relevant podcast topics
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
        )
        ai_response = response.choices[0].message.content
        topics = json.loads(ai_response)

        # Fetch relevant podcasts for each topic
        enriched_podcasts = []
        for topic in topics.get("podcasts", []):
            spotify_data = search_spotify_podcasts(topic["title"])
            for show in spotify_data:
                enriched_podcasts.append({
                    "name": show["name"],
                    "description": show["description"],
                    "spotify_url": show["external_urls"]["spotify"],
                    "image": show["images"][0]["url"] if show["images"] else None,
                })

        return jsonify({"podcasts": enriched_podcasts}), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch podcasts", "details": str(e)}), 500

    """
    Recommend podcasts based on user interests.
    """
    data = request.json
    interests = data.get("interests")

    if not interests or not isinstance(interests, list):
        return jsonify({"error": "Interests must be a list of strings."}), 400

    query = ", ".join(interests)
    prompt = f"""
    Based on the following user interests: {query}, provide:
    - Five relevant podcast topics.
    - Each podcast topic must include a concise title and description.
    """

    try:
        # Call OpenAI for relevant podcast topics
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
        )
        ai_response = response.choices[0].message.content
        topics = json.loads(ai_response)

        # Fetch relevant podcasts for each topic
        enriched_podcasts = []
        for topic in topics.get("podcasts", []):
            spotify_data = search_spotify_podcasts(topic["title"])
            for show in spotify_data:
                enriched_podcasts.append({
                    "name": show["name"],
                    "description": show["description"],
                    "spotify_url": show["external_urls"]["spotify"],
                    "image": show["images"][0]["url"] if show["images"] else None,
                })

        return jsonify({"podcasts": enriched_podcasts}), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch podcasts", "details": str(e)}), 500


# Improved Spotify Search Function
def search_spotify(query, search_type, artist=None):
    """
    Search Spotify for albums or artists and return the most accurate match.
    Filters results using optional artist name.
    """
    token = get_spotify_access_token()
    url = f"https://api.spotify.com/v1/search?q={query}&type={search_type}&limit=5"
    headers = {"Authorization": f"Bearer {token}"}

    response = requests.get(url, headers=headers)
    if response.status_code != 200:
        print(f"Spotify API Error: {response.json()}")
        return None
    results = response.json()
    if search_type == 'album':
        albums = results.get("albums", {}).get("items", [])
        # Filter albums to match the artist name (if provided)
        if artist:
            albums = [album for album in albums if artist.lower() in album["artists"][0]["name"].lower()]
        return albums[0] if albums else None  # Return the best match

    elif search_type == 'artist':
        artists = results.get("artists", {}).get("items", [])
        return artists[0] if artists else None

    return None

@app.route('/spotify/token', methods=['POST'])
def get_token():
    """
    Exchange authorization code for Spotify access and refresh tokens.
    """
    code = request.json.get("code")
    if not code:
        return jsonify({"error": "Authorization code not provided"}), 400

    token_url = "https://accounts.spotify.com/api/token"
    payload = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": REDIRECT_URI,
        "client_id": SPOTIFY_CLIENT_ID,
        "client_secret": SPOTIFY_CLIENT_SECRET,
    }
    response = requests.post(token_url, data=payload)

    if response.status_code == 200:
        token_data = response.json()
        SPOTIFY_TOKEN["access_token"] = token_data.get("access_token")
        SPOTIFY_TOKEN["refresh_token"] = token_data.get("refresh_token")
        return jsonify(token_data)
    else:
        return jsonify({"error": "Failed to fetch token", "details": response.json()}), response.status_code


@app.route('/spotify/refresh_token', methods=['POST'])
def refresh_token():
    """
    Refresh Spotify access token.
    """
    if not SPOTIFY_TOKEN.get("refresh_token"):
        return jsonify({"error": "No refresh token available"}), 400

    token_url = "https://accounts.spotify.com/api/token"
    payload = {
        "grant_type": "refresh_token",
        "refresh_token": SPOTIFY_TOKEN["refresh_token"],
        "client_id": SPOTIFY_CLIENT_ID,
        "client_secret": SPOTIFY_CLIENT_SECRET,
    }
    response = requests.post(token_url, data=payload)

    if response.status_code == 200:
        token_data = response.json()
        SPOTIFY_TOKEN["access_token"] = token_data.get("access_token")
        return jsonify(token_data)
    else:
        return jsonify({"error": "Failed to refresh token", "details": response.json()}), response.status_code


@app.route('/api/recommend', methods=['POST'])
def recommend():
    """
    Generate music recommendations with enriched Spotify data (images and links).
    """
    data = request.json
    tracks = data.get("tracks", [])
    if not isinstance(tracks, list) or not all(isinstance(track, str) for track in tracks):
        return jsonify({"error": "Invalid input. Tracks must be a list of strings."}), 400

    track_names = ", ".join(tracks)
    prompt = f"""
    Based on the following tracks: {track_names}, provide:
    1. Five accurate album recommendations. Each album must include:
       - The name of the album
       - The correct artist
       - The release year
       - A brief description of the album's style and content
    2. Five new singers or bands with their genres, descriptions, and a notable song of theirs.
    Ensure that album names and artist names are precise and searchable on Spotify.
    Format the response as a JSON object with two keys: "albums" and "singers".
    """

    try:
        # Call OpenAI API for recommendations
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1500,
        )
        ai_response = response.choices[0].message.content
        recommendations = json.loads(ai_response)

        enriched_albums = []
        for album in recommendations.get("albums", []):
            spotify_data = search_spotify(album["name"], "album")
            if spotify_data:
                album["spotify_url"] = spotify_data["external_urls"]["spotify"]
                album["image"] = spotify_data["images"][0]["url"] if spotify_data["images"] else None
            enriched_albums.append(album)
 
        enriched_singers = []
        for singer in recommendations.get("singers", []):
            spotify_data = search_spotify(singer["name"], "artist")
            if spotify_data:
                singer["spotify_url"] = spotify_data["external_urls"]["spotify"]
                singer["image"] = spotify_data["images"][0]["url"]
            enriched_singers.append(singer)

        # Return enriched results
        return jsonify({"albums": enriched_albums, "singers": enriched_singers}), 200
    except Exception as e:
        return jsonify({"error": "Failed to generate recommendations", "details": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
