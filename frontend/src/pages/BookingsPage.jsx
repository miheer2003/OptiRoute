import React from 'react';

const BookingsPage = () => {
    return (
        <div className="profile-container" style={{ color: 'white' }}>
            <h2>My Bookings</h2>
            <div className="search-card">
                <p style={{ textAlign: 'center', color: '#94a3b8' }}>
                    You have no upcoming bookings.
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                    <a href="/search" className="btn-primary" style={{ display: 'inline-block', maxWidth: '200px', textAlign: 'center', margin: '0 auto' }}>
                        Book a Trip
                    </a>
                </div>
            </div>
        </div>
    );
};

export default BookingsPage;
