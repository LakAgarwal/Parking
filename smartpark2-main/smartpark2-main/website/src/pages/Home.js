import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import ProjectInfo from '../components/Info';
import ParkingAreaListing from '../components/ParkingAreaListing.js';
import ParkingAreaDetails from '../components/ParkingAreaDetails.js';

const areasData = [
  { id: 1, name: 'Area 1' },
  { id: 2, name: 'Area 2' },
  { id: 3, name: 'Area 3' },
  { id: 4, name: 'Area 4' },
  { id: 5, name: 'Area 5' },
  { id: 6, name: 'Area 6' },
  // Add more area data
];

const Home = () => {
  const [selectedArea, setSelectedArea] = useState(null);

  const handleSelectArea = (areaId) => {
    setSelectedArea(areaId);
  };

  return (
    <div className="app-shell">
      <Navbar />
      {!selectedArea ? (
        <>
          <ProjectInfo />
          <ParkingAreaListing areas={areasData} onSelectArea={handleSelectArea} />
        </>
      ) : (
        <ParkingAreaDetails
          area={areasData.find((area) => area.id === selectedArea)}
          availableSlots={10}
          bookedSlots={3}
          mapLink="https://goo.gl/maps/FLCnK4q3YX7eZ1JE8"
        />
      )}
    </div>
  );
};


export default Home;
