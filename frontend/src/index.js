import React from 'react';
import ReactDOM from 'react-dom';
import App from './app'; // Import App component
import './index.css';

ReactDOM.render(
    <React.StrictMode>
        <App /> {/* Render App component which includes the routes */}
    </React.StrictMode>,
    document.getElementById('root')
);
