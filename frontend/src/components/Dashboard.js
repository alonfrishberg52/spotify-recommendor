import React, { useEffect, useState } from 'react';
import { fetchTopTracks, fetchRecommendations, fetchWeeklyInsights, fetchAvailableGenres, fetchRecommendationsByGenre } from '../api';
import { Bar } from 'react-chartjs-2';

const Dashboard = () => {
    const [topTracks, setTopTracks] = useState([]);
    const [recommendations, setRecommendations] = useState({ albums: [], singers: [] });
    const [weeklyInsights, setWeeklyInsights] = useState(null);
    const [availableGenres, setAvailableGenres] = useState([]);
    const [selectedGenres, setSelectedGenres] = useState([]);
    const [genreRecommendations, setGenreRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [notifications, setNotifications] = useState([]);

    // Fetch initial data
    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('access_token');
            console.log('Access Token:', token);

            if (!token) {
                console.warn('No access token available. Redirecting to login...');
                return;
            }

            try {
                // Fetch Top Tracks
                const tracks = await fetchTopTracks();
                setTopTracks(tracks);

                // Fetch Recommendations Based on Top Tracks
                const trackNames = tracks.map((track) => track.name);
                const result = await fetchRecommendations(trackNames);
                setRecommendations(result);

                // Fetch Weekly Music Insights
                const insights = await fetchWeeklyInsights();
                setWeeklyInsights(insights);

                // Fetch Available Genres
                const genres = await fetchAvailableGenres();
                setAvailableGenres(genres);

                addNotification('Data successfully loaded!');
            } catch (err) {
                setError('Failed to fetch data. Please try again.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Add a new notification
    const addNotification = (message) => {
        setNotifications((prev) => [...prev, message]);
        setTimeout(() => {
            setNotifications((prev) => prev.slice(1)); // Remove after 5 seconds
        }, 5000);
    };

    // Handle genre selection
    const handleGenreChange = (event) => {
        const { value, checked } = event.target;
        if (checked) {
            setSelectedGenres((prev) => [...prev, value]);
        } else {
            setSelectedGenres((prev) => prev.filter((genre) => genre !== value));
        }
    };

    // Fetch genre-based recommendations
    const fetchGenreRecommendations = async () => {
        setLoading(true);
        try {
            const recommendations = await fetchRecommendationsByGenre(selectedGenres);
            setGenreRecommendations(recommendations);
            addNotification('New genre-based recommendations fetched!');
        } catch (err) {
            console.error('Error fetching genre recommendations:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 text-lg p-10">
                {error}
            </div>
        );
    }

    return (
        <div
            style={{
                fontFamily: "'Poppins', sans-serif",
                background: 'linear-gradient(to right, #2c3e50, #4ca1af)',
                color: '#fff',
                minHeight: '100vh',
                padding: '20px',
            }}
        >
            {/* Notifications */}
            <div style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 1000 }}>
                {notifications.map((notification, index) => (
                    <div
                        key={index}
                        style={{
                            background: '#4caf50',
                            color: '#fff',
                            padding: '10px',
                            borderRadius: '5px',
                            marginBottom: '10px',
                        }}
                    >
                        {notification}
                    </div>
                ))}
            </div>

            {/* App Header */}
            <header className="text-center mb-10">
                <h1 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '1rem' }}>
                    Aurora Tunes
                </h1>
                <p style={{ fontSize: '1.2rem', color: '#d1d1d1' }}>
                    Discover your favorite tracks, albums, and artists powered by AI, tailored just for you!
                </p>
            </header>

            {/* Weekly Music Insights */}
            {weeklyInsights && (
                <section style={{ marginBottom: '40px' }}>
                    <h2>Weekly Music Insights</h2>
                    <h3>Top Artists</h3>
                    <div style={{ display: 'flex', gap: '15px', overflowX: 'auto' }}>
                        {weeklyInsights.topArtists.map((artist, index) => (
                            <div key={index} style={{ textAlign: 'center', width: '150px' }}>
                                <img
                                    src={artist.image}
                                    alt={artist.name}
                                    style={{ width: '100px', height: '100px', borderRadius: '50%' }}
                                />
                                <p>{artist.name}</p>
                            </div>
                        ))}
                    </div>

                    {/* Bar Chart */}
                    <div style={{ marginTop: '20px' }}>
                        <Bar
                            data={{
                                labels: weeklyInsights.topArtists.map((artist) => artist.name),
                                datasets: [
                                    {
                                        label: 'Popularity',
                                        data: weeklyInsights.topArtists.map((artist) => artist.popularity),
                                        backgroundColor: 'rgba(54, 162, 235, 0.6)',
                                    },
                                ],
                            }}
                            options={{
                                responsive: true,
                                plugins: { legend: { display: false } },
                            }}
                        />
                    </div>

                    <h3>Top Genres</h3>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        {weeklyInsights.topGenres.map((genre, index) => (
                            <span
                                key={index}
                                style={{
                                    background: '#ddd',
                                    padding: '5px 10px',
                                    borderRadius: '5px',
                                    fontSize: '0.9rem',
                                }}
                            >
                                {genre}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {/* Top Tracks */}
            <h2>Top Tracks</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                {topTracks.map((track) => (
                    <div
                        key={track.id}
                        style={{
                            background: '#34495e',
                            borderRadius: '10px',
                            padding: '15px',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                        }}
                    >
                        <img
                            src={track.album.images[0]?.url}
                            alt={track.name}
                            style={{
                                width: '100%',
                                height: '150px',
                                objectFit: 'cover',
                                borderRadius: '8px',
                                marginBottom: '10px',
                            }}
                        />
                        <h3
                            style={{
                                fontSize: '1.2rem',
                                fontWeight: '600',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {track.name}
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: '#b0c4de' }}>
                            by {track.artists.map((artist) => artist.name).join(', ')}
                        </p>
                    </div>
                ))}
            </div>

            {/* Genre-Based Recommendations */}
            <section>
                <h2>Genre-Based Recommendations</h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {availableGenres.map((genre) => (
                        <label key={genre}>
                            <input type="checkbox" value={genre} onChange={handleGenreChange} />
                            {genre}
                        </label>
                    ))}
                </div>
                <button
                    onClick={fetchGenreRecommendations}
                    disabled={selectedGenres.length === 0}
                    style={{
                        marginTop: '20px',
                        padding: '10px 20px',
                        background: '#007bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Get Recommendations
                </button>
                <div style={{ marginTop: '20px' }}>
                    {genreRecommendations.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                            {genreRecommendations.map((track) => (
                                <div
                                    key={track.id}
                                    style={{
                                        background: '#fff',
                                        padding: '10px',
                                        borderRadius: '10px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        width: '200px',
                                    }}
                                >
                                    <img
                                        src={track.album.images[0]?.url}
                                        alt={track.name}
                                        style={{ width: '100%', borderRadius: '8px' }}
                                    />
                                    <p>{track.name}</p>
                                    <p style={{ color: '#666' }}>
                                        by {track.artists.map((artist) => artist.name).join(', ')}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Dashboard;
