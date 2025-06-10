import React from 'react';

const ProgressBar = ({ progress = 70 }) => {
    return (
        <div style={{ marginBottom: '20px' }}>
            <div
                style={{
                    height: '10px',
                    width: '100%',
                    backgroundColor: '#ddd',
                    borderRadius: '5px',
                }}
            >
                <div
                    style={{
                        height: '10px',
                        width: `${progress}%`,
                        backgroundColor: '#4caf50',
                        borderRadius: '5px',
                        transition: 'width 0.3s ease-in-out',
                    }}
                ></div>
            </div>
            <p style={{ fontSize: '0.9rem', color: '#fff', textAlign: 'center', marginTop: '5px' }}>
                Progress: {progress}%
            </p>
        </div>
    );
};

export default ProgressBar;
