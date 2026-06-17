import React from 'react';

export default function CardInfo() {
  const cards = [
    {
      tag: "Instant Insight",
      title: "No More Searching",
      copy: "Find available parking spots quickly with real-time area visibility.",
    },
    {
      tag: "Quick Access",
      title: "Faster Entry & Exit",
      copy: "Use QR validation for smooth access without waiting in long queues.",
    },
    {
      tag: "Live Tracking",
      title: "Smarter Slot Control",
      copy: "Track booking status and occupancy trends with a single dashboard.",
    },
    {
      tag: "Secure Flow",
      title: "Built For Reliability",
      copy: "Simple, secure, and consistent booking flows for every user.",
    },
  ];

  return (
    <section className="insight-grid">
      {cards.map((card) => (
        <article key={card.title} className="insight-card">
          <span className="insight-tag">{card.tag}</span>
          <h3 className="insight-title">{card.title}</h3>
          <p className="insight-copy">{card.copy}</p>
        </article>
      ))}
    </section>
  );
}
