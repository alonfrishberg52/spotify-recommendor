import React, { useEffect } from 'react';
import { exchangeCodeForToken } from '../api';
import { useNavigate } from 'react-router-dom';


const Callback = () => {
    const navigate = useNavigate(); // Hook to navigate the user

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const authCode = urlParams.get('code'); // Extract the authorization code

        if (authCode) {
            exchangeCodeForToken(authCode)
                .then((data) => {
                    console.log('Access Token Response:', data);
                    localStorage.setItem('access_token', data.access_token);
                    localStorage.setItem('refresh_token', data.refresh_token);
                    window.location.href = '/dashboard'; // Redirect to the dashboard
                })
                .catch((error) => {
                    console.error('Error exchanging token:', error);
                    console.log('Redirecting to login page...');
                    window.location.href = '/'; // Redirect back to login if token exchange fails
                });
        } else {
            console.error('Authorization code not found in URL.');
            navigate('/'); // Redirect if no code is available

        }
    }, []);

    return <div>Authenticating...</div>;
};

export default Callback;
