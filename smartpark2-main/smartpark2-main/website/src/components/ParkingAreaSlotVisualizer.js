import React from 'react';

const ParkingAreaSlotVisualizer = ({ totalSlots, availableSlots, bookedSlots }) => {
  const slots = new Array(totalSlots).fill(null).map((_, index) => ({
    available: index < availableSlots,
  }));

  return (
    <div className="slot-grid">
      {slots.map((slot, index) => (
        <div className="slot-chip" key={`${index}-${slot.available}`}>
          <div className={`slot-dot ${slot.available ? 'slot-available' : 'slot-booked'}`}></div>
          <span>Slot:-{index + 1}</span>
        </div>
      ))}
    </div>
  );
};

export default ParkingAreaSlotVisualizer;


