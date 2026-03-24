import React from 'react';

export const Footer: React.FC = () => (
  <div className="app-footer">
    <div className="app-footer__left">
      <span className="app-footer__title">FatData Visiology Theme Generator</span>
      <span className="app-footer__author">Автор и разработчик: Чжен Артём</span>
    </div>
    <a
      className="app-footer__link"
      href="https://t.me/teamfatdata"
      target="_blank"
      rel="noopener noreferrer"
    >
      FatData community →
    </a>
  </div>
);
