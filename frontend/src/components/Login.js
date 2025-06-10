import React from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles"; // Import loadFull for proper configuration

const Login = () => {
    const clientId = process.env.REACT_APP_SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.REACT_APP_SPOTIFY_REDIRECT_URI;

    const scopes = [
        "playlist-read-private",
        "user-read-private",
        "user-top-read",
        "user-read-recently-played",
    ];

    const generateAuthUrl = () => {
        return `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(
            redirectUri
        )}&scope=${encodeURIComponent(scopes.join(" "))}`;
    };

    const handleLogin = () => {
        const authUrl = generateAuthUrl();
        console.log("Redirecting to Spotify...");
        window.location.href = authUrl;
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        else if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    };

    // Initialize Particles
    const particlesInit = async (main) => {
        await loadFull(main);
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                background: "linear-gradient(to bottom right, #3b82f6, #9333ea, #22d3ee)",
                color: "#ffffff",
                fontFamily: "'Poppins', sans-serif",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
            }}
        >
            {/* Particles Background */}
            <Particles
                id="tsparticles"
                init={particlesInit}
                options={{
                    background: {
                        color: {
                            value: "transparent",
                        },
                    },
                    particles: {
                        number: {
                            value: 50,
                        },
                        shape: {
                            type: "circle",
                        },
                        color: {
                            value: "#ffffff",
                        },
                        opacity: {
                            value: 0.5,
                        },
                        size: {
                            value: 3,
                        },
                        move: {
                            enable: true,
                            speed: 2,
                            direction: "none",
                            random: false,
                            straight: false,
                            outModes: {
                                default: "out",
                            },
                        },
                        links: {
                            enable: false,
                        },
                    },
                    interactivity: {
                        events: {
                            onHover: {
                                enable: true,
                                mode: "repulse",
                            },
                        },
                        modes: {
                            repulse: {
                                distance: 100,
                            },
                        },
                    },
                }}
                style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: -1,
                }}
            />

            {/* Dynamic Greeting */}
            <h2 style={{ marginBottom: "20px", color: "#d1d1d1" }}>{getGreeting()}!</h2>

            {/* Updated Custom Circle Logo */}
            <img
                src="/app_logo.webp"
                alt="Aurora Tunes Logo"
                style={{
                    width: "150px",
                    marginBottom: "20px",
                    animation: "fadeIn 2s",
                }}
            />

            {/* Main Heading */}
            <h1 style={{ fontSize: "3rem", fontWeight: "700", marginBottom: "10px" }}>
                Welcome to Aurora Tunes
            </h1>
            <p style={{ fontSize: "1.2rem", marginBottom: "30px", color: "#d1d1d1" }}>
                Discover music, podcasts, and personalized recommendations powered by Spotify
            </p>

            {/* Buttons */}
            <div>
                <button
                    onClick={handleLogin}
                    style={{
                        backgroundColor: "#9333ea",
                        color: "#fff",
                        border: "none",
                        padding: "12px 24px",
                        fontSize: "1rem",
                        fontWeight: "600",
                        borderRadius: "50px",
                        cursor: "pointer",
                        margin: "10px",
                        transition: "all 0.3s ease",
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = "#3b82f6")}
                    onMouseOut={(e) => (e.target.style.backgroundColor = "#9333ea")}
                >
                    Login with Spotify
                </button>
            </div>

            {/* Developer Credit */}
            <div style={{ marginTop: "40px", textAlign: "center" }}>
                <img
                    src={require("./alonpic.jpeg")}
                    alt="Developer Alon Frishberg"
                    style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        marginBottom: "10px",
                        border: "3px solid #3b82f6",
                    }}
                />
                <h3 style={{ margin: "0", color: "#ffffff" }}>Developed by Alon Frishberg</h3>
                <p style={{ fontSize: "0.9rem", color: "#d1d1d1" }}>
                    Passionate about music, tech, and great design.
                </p>
                <a
                    href="https://www.linkedin.com/in/alon-frishberg-17a995151/"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        color: "#1DB954",
                        textDecoration: "none",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        marginTop: "10px",
                        transition: "color 0.3s ease",
                    }}
                    onMouseOver={(e) => (e.target.style.color = "#1ed760")}
                    onMouseOut={(e) => (e.target.style.color = "#1DB954")}
                >
                    Connect on LinkedIn
                </a>
            </div>

            {/* Footer */}
            <footer style={{ marginTop: "30px", fontSize: "0.9rem", color: "#aaa" }}>
                <p>Powered by Spotify API | Aurora Tunes © {new Date().getFullYear()}</p>
            </footer>
        </div>
    );
};

export default Login;
