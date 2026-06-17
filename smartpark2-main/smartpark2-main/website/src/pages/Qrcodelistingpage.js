import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QRCodeListingPage = () => {
  // Get user_id from localStorage
  const user_id = localStorage.getItem('userId');

  const currentDate = new Date().toISOString().split('T')[0]; 

  // Initialize date with the current date (YYYY-MM-DD format)
  const [date, setDate] = useState(currentDate);
  const [qrCodes, setQrCodes] = useState([]);

  const getQrCodes = () => {
    axios
      .get(`http://localhost:8080/api/v1/slot/slotbookings/${user_id}/${date}`)
      .then((response) => {
        setQrCodes(response.data);
      })
      .catch((error) => {
        console.error('Error getting QR codes:', error);
      });
  };

  useEffect(() => {
    getQrCodes();
  }, []);

  return (
    <div className="container mx-auto p-4 flex item-center justify-center m-10 ">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-semibold mb-4">QR Code Listing</h1>
        <div className="mb-4">
          <label className="mr-2">User ID:</label>
          <span className="font-semibold">{user_id}</span>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-2">QR Codes:</h2>
          <ul>
            {qrCodes.map((qrCode) => (
              <li key={qrCode._id} className="mb-2">
                {qrCode._id}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default QRCodeListingPage;

