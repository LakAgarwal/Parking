import React, { useState } from 'react';

const AdminForm = () => {
  const [formData, setFormData] = useState({
    areaname: '',
    Totalslots: '',
    areaLocation: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,

    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
console.log(formData);
    fetch('http://localhost:5000/api/v1/parking/areas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    })
      .then(response => response.json())
      .then(data => {
        // Handle success or error based on the response from the backend
        console.log(data);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-md shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">Admin Form</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="totalAreas" className="block text-sm font-semibold text-gray-600">
            Area Name:
          </label>
          <input
            type="text"
            id="areaname"
            name="areaname"  
            value={formData.areaname}
            onChange={handleChange}
            className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
            required
        />
        </div>

        <div className="mb-4">
          <label htmlFor="totalSlots" className="block text-sm font-semibold text-gray-600">
            Total Number of Slots:
          </label>
          <input
            type="number"
            id="Totalslots"
            name="Totalslots"
            value={formData.Totalslots}
            onChange={handleChange}
            className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="mapLink" className="block text-sm font-semibold text-gray-600">
            Navigation Link (Google Map Link):
          </label>
          <input
            type="text"
            id="mapLink"
            name="mapLink"
            value={formData.mapLink}
            onChange={handleChange}
            className="w-full p-2 border-b-2 border-gray-300 focus:outline-none focus:border-blue-500"
            required
          />
        </div>

        <div className="text-center">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 focus:outline-none"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminForm;
