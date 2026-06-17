import React from 'react';
import { Link } from 'react-router-dom';

const BookSlotButton = () => {
  return (
    <div className="text-center mt-6">
      <Link
        to="/bookslot"
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full transition duration-300"
      >
        Book Your Slot
      </Link>
    </div>
  );
}; 

export default BookSlotButton;
