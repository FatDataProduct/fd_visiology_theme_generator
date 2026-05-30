import React from 'react';

type MobilePanelProps = {
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export const MobilePanel: React.FC<MobilePanelProps> = ({ title, children, className = '' }) => (
  <div className={`mobile-panel ${className}`.trim()}>
    {title && <h2 className="mobile-panel__title">{title}</h2>}
    <div className="mobile-panel__body">{children}</div>
  </div>
);
