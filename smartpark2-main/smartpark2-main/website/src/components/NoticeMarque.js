import React from 'react';

const NoticeMarquee = ({notice}) => {
  return (
    <div className="notice-bar">
      <p>{notice}</p>
    </div>
  );
};

export default NoticeMarquee;
