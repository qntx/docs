import React from 'react';
import clsx from 'clsx';
export default function FooterLayout({style, links, logo, copyright}) {
  // Removed footer--dark class to allow CSS variables to control colors in both modes
  return (
    <footer
      className="footer">
      <div className="container container-fluid">
        {links}
        {(logo || copyright) && (
          <div className="footer__bottom text--left">
            {logo && <div className="margin-bottom--sm">{logo}</div>}
            {copyright}
          </div>
        )}
      </div>
    </footer>
  );
}
