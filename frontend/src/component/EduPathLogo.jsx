import React, { useId } from 'react';

const EduPathLogo = ({ size = 40, showText = true, fontSize, className = '' }) => {
  const uid = useId().replace(/:/g, '');

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Background gradient: indigo → violet */}
          <linearGradient id={`bg-${uid}`} x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4f46e5" />
            <stop offset="1" stopColor="#7c3aed" />
          </linearGradient>

          {/* Arrow / path accent gradient: cyan → indigo */}
          <linearGradient id={`acc-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#38bdf8" />
            <stop offset="1" stopColor="#818cf8" />
          </linearGradient>

          {/* Soft inner highlight */}
          <radialGradient id={`glow-${uid}`} cx="50%" cy="30%" r="60%">
            <stop stopColor="white" stopOpacity="0.15" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Rounded square background */}
        <rect width="40" height="40" rx="9" fill={`url(#bg-${uid})`} />

        {/* Inner glow overlay */}
        <rect width="40" height="40" rx="9" fill={`url(#glow-${uid})`} />

        {/* Subtle border shine */}
        <rect width="39" height="39" x="0.5" y="0.5" rx="8.5" stroke="white" strokeOpacity="0.12" />

        {/* ── Open book ── */}
        {/* Left page */}
        <path
          d="M20 11.5 C17 10.5 12.5 11 9.5 12.5 L9.5 27.5 C12.5 26 17 25.5 20 26.5 Z"
          fill="white"
          fillOpacity="0.95"
        />

        {/* Right page */}
        <path
          d="M20 11.5 C23 10.5 27.5 11 30.5 12.5 L30.5 27.5 C27.5 26 23 25.5 20 26.5 Z"
          fill="white"
          fillOpacity="0.55"
        />

        {/* Spine */}
        <line x1="20" y1="11" x2="20" y2="27.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" />

        {/* Left page lines (text effect) */}
        <line x1="12" y1="17" x2="18.2" y2="16.2" stroke="white" strokeOpacity="0.35" strokeWidth="1" strokeLinecap="round" />
        <line x1="12" y1="20" x2="18.2" y2="19.3" stroke="white" strokeOpacity="0.35" strokeWidth="1" strokeLinecap="round" />
        <line x1="12" y1="23" x2="17" y2="22.4" stroke="white" strokeOpacity="0.25" strokeWidth="1" strokeLinecap="round" />

        {/* ── Upward arrow on right page (the "Path") ── */}
        <path
          d="M25.5 25 L25.5 18.5"
          stroke={`url(#acc-${uid})`}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M23 21 L25.5 18 L28 21"
          stroke={`url(#acc-${uid})`}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Text */}
      {showText && (
        <span style={{ fontSize: fontSize ?? size * 0.53, lineHeight: 1 }} className="font-extrabold tracking-tight select-none">
          <span className="text-white">Edu</span>
          <span
            style={{
              background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Path
          </span>
        </span>
      )}
    </div>
  );
};

export default EduPathLogo;
