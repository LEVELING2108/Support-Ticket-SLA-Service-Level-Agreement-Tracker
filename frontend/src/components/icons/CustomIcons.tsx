import React from 'react';

// Brand Shield Icon matching the UI mockups
export const BrandIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 12l2 2 4-4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Circular SLA Progress Ring Icon for SLA countdowns
export const SLARingIcon: React.FC<{
  percentage?: number;
  state: 'ON_TRACK' | 'AT_RISK' | 'BREACHED';
  className?: string;
}> = ({ state, className = 'w-4 h-4' }) => {
  const getColor = () => {
    switch (state) {
      case 'ON_TRACK':
        return '#10b981'; // emerald-500
      case 'AT_RISK':
        return '#f59e0b'; // amber-500
      case 'BREACHED':
        return '#ef4444'; // rose-500
      default:
        return '#10b981';
    }
  };

  const strokeColor = getColor();

  return (
    <svg viewBox="0 0 24 24" className={`${className} shrink-0`} fill="none">
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="#e5e7eb"
        strokeWidth="2.5"
      />
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke={strokeColor}
        strokeWidth="2.5"
        strokeDasharray="56.5"
        strokeDashoffset="18"
        strokeLinecap="round"
        transform="rotate(-90 12 12)"
      />
    </svg>
  );
};

export const BusinessClockIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const MilestoneBeaconIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="2" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

export const AgentRoleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export const ReporterRoleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
