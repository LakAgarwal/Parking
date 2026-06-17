import React from 'react';

const Navigationbar = () => {
  return (
    <nav className="surface-card top-nav">
      <div className="brand">smartpark</div>
      <div className="top-nav-links">
        <a href="/home">Home</a>
        <a href="/qrcodelisting">Reservations</a>
        <a href="/home">Profile</a>
        <a href="/">Logout</a>
      </div>
    </nav>
  );
};

export default Navigationbar;
