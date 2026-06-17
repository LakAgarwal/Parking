import React from 'react';
import Areacard from './Areacards';

const ParkingAreaListing = ({ areas, onSelectArea }) => {
  return (
    <section className="surface-card zones-section">
      <p className="zones-eyebrow">Reserve By Zone</p>
      <h2 className="zones-title">Parking Areas</h2>
      <p className="zones-subtitle">Select an area and book the slot that fits your route.</p>
      <div className="zone-grid">
        {areas.map((area) => (
          <Areacard key={area.id} area={area} onSelectArea={onSelectArea} />
        ))}
      </div>
    </section>
  );
};

export default ParkingAreaListing;
