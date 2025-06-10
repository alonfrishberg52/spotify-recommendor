import React from 'react';

const SearchBar = ({ searchTerm, setSearchTerm }) => {
    return (
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search your favorite tracks..."
                style={{
                    width: '80%',
                    padding: '10px',
                    fontSize: '1rem',
                    borderRadius: '20px',
                    border: '1px solid #ddd',
                    outline: 'none',
                }}
            />
        </div>
    );
};

export default SearchBar;
