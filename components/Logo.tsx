import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon-only' | 'horizontal';
}

export const Logo: React.FC<LogoProps> = ({ className = "h-12", variant = 'horizontal' }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Icon Graphic */}
      <svg viewBox="0 0 100 90" className="h-full w-auto flex-shrink-0" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Red Roof */}
        <path d="M10 45 L50 10 L90 45" stroke="#ED1C24" strokeWidth="8" strokeLinecap="square" />
        {/* Blue Chimney */}
        <rect x="65" y="15" width="8" height="20" fill="#00AEEF" />
        <rect x="76" y="20" width="8" height="15" fill="#00AEEF" />
        {/* Blue Windows */}
        <rect x="35" y="40" width="13" height="13" fill="#00AEEF" />
        <rect x="52" y="40" width="13" height="13" fill="#00AEEF" />
        <rect x="35" y="57" width="13" height="13" fill="#00AEEF" />
        <rect x="52" y="57" width="13" height="13" fill="#00AEEF" />
        {/* Red Bottom Line */}
        <path d="M25 82 H75" stroke="#ED1C24" strokeWidth="6" />
        <path d="M25 82 V55" stroke="#ED1C24" strokeWidth="6" />
        <path d="M75 82 V55" stroke="#ED1C24" strokeWidth="6" />
      </svg>

      {/* Typography */}
      {variant !== 'icon-only' && (
        <div className="flex flex-col justify-center leading-none">
          <span className="text-[#00AEEF] font-bold text-2xl tracking-tight" style={{ fontFamily: 'Arial, sans-serif' }}>
            PROVISION
          </span>
          <span className="text-[#ED1C24] font-bold text-[0.6rem] tracking-widest uppercase">
            Land & Properties Limited
          </span>
          {variant === 'full' && (
            <span className="text-[#00AEEF] text-[0.5rem] italic mt-1 font-serif">
              We Promise and Deliver Genuinely
            </span>
          )}
        </div>
      )}
    </div>
  );
};