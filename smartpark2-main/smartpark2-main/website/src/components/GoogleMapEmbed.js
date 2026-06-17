import React from 'react';


const GoogleMapEmbed = ( {mapLink} ) => {
  return (
    <div className="mt-4">
      <iframe
        title="Google Map"
        width="100%"
        height="300"
        style={{ border: 0 }}
        src={mapLink}
        allowFullScreen
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
      ></iframe>
    </div>
  );

};

export default GoogleMapEmbed;