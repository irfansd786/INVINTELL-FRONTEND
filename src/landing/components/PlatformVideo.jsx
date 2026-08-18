import React, { useRef } from 'react';

export default function PlatformVideo({ posterSrc = '' }) {
  const videoRef = useRef(null);

  return (
    <section id="platform-video" className="inv-video-section">
      <div className="inv-section-container">
        <div className="inv-section-label">PLATFORM PREVIEW</div>
        <h2 className="inv-section-heading">See INVINTELL in action.</h2>

        <div className="inv-video-frame">
          <div className="inv-video-wrapper">
            <video
              ref={videoRef}
              className="inv-video-player"
              controls
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={posterSrc}
            >
              <source src="/video/123.mp4" type="video/mp4" />
              <source src="/video/demo.mp4" type="video/mp4" />
              <source src="/video/video.mp4" type="video/mp4" />
              Your browser does not support HTML5 video.
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
