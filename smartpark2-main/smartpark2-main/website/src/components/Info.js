import React from 'react';
import CardInfo from "./Infocards";

const ProjectInfo = () => {
  return (
    <section className="surface-card hero-block">
      <p className="hero-eyebrow">Smart Parking Platform</p>
      <h2 className="hero-title">Navigate your parking experience with smartpark</h2>
      <p className="hero-subtitle">
        Live slot visibility, faster entry, and reliable reservations in one clean workflow.
      </p>
      <CardInfo />
    </section>
  );
};

export default ProjectInfo;
