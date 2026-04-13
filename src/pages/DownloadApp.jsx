import React from 'react';
import { Link } from 'react-router-dom';
import './DownloadApp.css';

const DownloadApp = () => {

  return (
    <div className="download-gate-container">
      <div className="download-gate-content">

        <div className="visual-section">
          <img
            src="/mockup.png"
            alt="Bhasha Setu App Mockup"
            className="mockup-image"
          />
        </div>

        <div className="info-section">
          <div className="brand-badge">Bhasha Setu pro+</div>

          <h1>
            A Better Platform For <br />
            Connecting Through <span>Language</span>
          </h1>

          <p>
            Experience seamless translation and community support like never before.
            Choose how you want to bridge the barrier today.
          </p>

          <div className="actions">

            <a
              href="https://uglezavtskhwpbvbwaco.supabase.co/storage/v1/object/public/chat-media/Apk/bhasha.setu.apk"
              className="btn btn-primary download-btn"
              download
            >
              DOWNLOAD APK
            </a>

            <Link
              to="/home"
              className="btn btn-primary download-btn"
            >
              CONTINUE IN WEBSITE
            </Link>

          </div>

          <div className="footer-info">
            v0.1 <span>(11.04 MB)</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DownloadApp;