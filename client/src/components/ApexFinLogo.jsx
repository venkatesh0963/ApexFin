import React from 'react';

const ApexFinLogo = ({ size = 40, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
    >
      <defs>
        <linearGradient id="apexFinBg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e40af" />
          <stop offset="55%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient
          id="apexFinTrend"
          x1="16"
          y1="48"
          x2="48"
          y2="14"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#6ee7b7" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>

      {/* Rounded FinTech Badge */}
      <rect x="2" y="2" width="60" height="60" rx="16" fill="url(#apexFinBg)" />

      {/* Tax Compliance Shield Contour */}
      <path
        d="M32 9L51 16.5V31C51 43.8 42.8 52.5 32 56C21.2 52.5 13 43.8 13 31V16.5L32 9Z"
        stroke="white"
        strokeOpacity="0.25"
        strokeWidth="2"
        fill="white"
        fillOpacity="0.06"
      />

      {/* Ascending Ledger Bars */}
      <rect x="20.5" y="35" width="5" height="11" rx="2" fill="white" fillOpacity="0.75" />
      <rect x="29.5" y="28.5" width="5" height="17.5" rx="2" fill="white" fillOpacity="0.9" />
      <rect x="38.5" y="22" width="5" height="24" rx="2" fill="#34d399" />

      {/* Apex Peak + Upward Financial Arrow */}
      <path
        d="M18.5 31L28 21.5L34 26L44.5 15.5"
        stroke="url(#apexFinTrend)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M38.5 15.5H44.5V21.5"
        stroke="#ffffff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default ApexFinLogo;
