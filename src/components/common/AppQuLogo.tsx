/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * AppQuLogo - Official AppQu Vector Logo Component
 * Berdasarkan rancangan logo resmi AppQu:
 * - Squircle base dengan gradien Orange (#FF9E2C) ke Cyan-Teal (#028090)
 * - Simbol Pin Lokasi membentuk huruf 'Q'
 * - Simbol Gotong-Royong / Komunitas 4 Tangan Bergandengan Saling Mengunci di Bagian Tengah
 */

import React from 'react';

interface AppQuLogoProps {
  size?: number | string;
  className?: string;
  rounded?: string;
  showShadow?: boolean;
}

export const AppQuLogo: React.FC<AppQuLogoProps> = ({
  size = 40,
  className = '',
  rounded = 'rounded-2xl',
  showShadow = true
}) => {
  return (
    <div 
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden ${rounded} ${showShadow ? 'shadow-md shadow-orange-950/20' : ''} ${className}`}
      style={{ width: size, height: size }}
      title="AppQu"
    >
      <img
        src="/icon.svg"
        alt="AppQu Logo"
        className="w-full h-full object-cover select-none pointer-events-none"
      />
    </div>
  );
};
