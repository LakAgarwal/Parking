import React, { useEffect, useState } from "react";
import { useLocation } from 'react-router-dom';

const BookingDetails = () => {
  const location = useLocation();
  const data = JSON.parse(location.state)?.data;
  const qrCodeSrc = data?.qrCodeSrc;
  const area = data?.name;
  const bookingTime = data.newSlotBooking.createdAt;

  const initialTimer = parseInt(localStorage.getItem("timer")) || 600;
  const [timer, setTimer] = useState(initialTimer);
  const [timerMessage, setTimerMessage] = useState("");

  const formatTimerremain = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };
  function formatTime(timestamp) {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const amOrPm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
  
    const formattedTime = `${formattedHours}:${minutes.toString().padStart(2, '0')}${amOrPm}`;
  
    return formattedTime;
  }
  

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);

      return () => {
        clearInterval(interval);
        localStorage.setItem("timer", timer.toString());
      };
    } else {
      setTimerMessage("The time limit is exceeded. You can book the slot again.");
      localStorage.removeItem("timer"); 
    }
  }, [timer]);

  return (
    <div className="booking-page">
      <div className="surface-card booking-card">
        <h2 className="booking-title">Booking Details</h2>
        <div className="booking-qr">
          <img alt="Booking QR" src={`data:image/png;base64,${qrCodeSrc}`} />
        </div>
        {timerMessage ? (
          <div className="timer" style={{ textAlign: "center" }}>{timerMessage}</div>
        ) : (
          <div className="booking-copy">
            <p>Slot Booking Details:</p>
            <ul>
              <li>
                <strong>Area:</strong> {area}
              </li>
              <li>
                <strong>Booking Time:</strong> {formatTime(bookingTime)}
              </li>
            </ul>
            <div className="timer">
              <p>Time Remaining: {formatTimerremain(timer)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingDetails;
