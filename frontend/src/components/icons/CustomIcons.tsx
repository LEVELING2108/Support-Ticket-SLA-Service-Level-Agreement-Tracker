import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

// 1. App Brand Logo: Geometric SLA Target Prism
export const BrandIcon: React.FC<IconProps> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="brandGrad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6366F1" />
        <stop offset="0.5" stopColor="#4F46E5" />
        <stop offset="1" stopColor="#312E81" />
      </linearGradient>
      <linearGradient id="brandAccent" x1="16" y1="6" x2="26" y2="26" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38BDF8" />
        <stop offset="1" stopColor="#6366F1" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#brandGrad)" />
    <circle cx="16" cy="16" r="10" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeDasharray="3 3" />
    <path
      d="M16 8V16L22 19"
      stroke="white"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="16" cy="16" r="2.5" fill="#38BDF8" />
    <path
      d="M23 7L27 11M27 7L23 11"
      stroke="url(#brandAccent)"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// 2. SLA On Track: Shield Check with Node Accent
export const SLAOnTrackIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M10 2L3 5.5V10.5C3 14.8 6 17.8 10 19C14 17.8 17 14.8 17 10.5V5.5L10 2Z"
      fill="#D1FAE5"
      stroke="#10B981"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path
      d="M6.5 10.2L8.8 12.5L13.5 7.8"
      stroke="#059669"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// 3. SLA At Risk: Warning Hourglass Prism
export const SLAAtRiskIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M10 2L18 16H2L10 2Z"
      fill="#FEF3C7"
      stroke="#F59E0B"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M10 7.5V11" stroke="#D97706" strokeWidth="2" strokeLinecap="round" />
    <circle cx="10" cy="13.8" r="1" fill="#D97706" />
  </svg>
);

// 4. SLA Breached: Octagon Flash Shield
export const SLABreachedIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <polygon
      points="6,2 14,2 18,6 18,14 14,18 6,18 2,14 2,6"
      fill="#FFE4E6"
      stroke="#EF4444"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M7 7L13 13M13 7L7 13" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// 5. Business Hours Clock: Stepped Gear-Clock
export const BusinessClockIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.8" />
    <path d="M10 5.5V10.2L13.5 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="10" cy="10" r="1.2" fill="currentColor" />
    <path d="M2.5 10H4M16 10H17.5M10 2.5V4M10 16V17.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

// 6. Urgent Priority Icon: Triple Radiant Bolt
export const UrgentPriorityIcon: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M9 1.5L2.5 9H8L7 14.5L13.5 7H8L9 1.5Z"
      fill="#EF4444"
      stroke="#DC2626"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);

// 7. High Priority Icon: Dual Alert Chevron
export const HighPriorityIcon: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M8 2.5L2.5 7L3.5 8L8 4.5L12.5 8L13.5 7L8 2.5Z" fill="#F97316" />
    <path d="M8 7.5L2.5 12L3.5 13L8 9.5L12.5 13L13.5 12L8 7.5Z" fill="#FB923C" />
  </svg>
);

// 8. Medium Priority Icon: Equilibrium Dual Bars
export const MediumPriorityIcon: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="2.5" y="5" width="11" height="2.2" rx="1.1" fill="#3B82F6" />
    <rect x="2.5" y="9" width="7" height="2.2" rx="1.1" fill="#60A5FA" />
  </svg>
);

// 9. Low Priority Icon: Base Plate Foundation
export const LowPriorityIcon: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="8" cy="8" r="4" fill="#94A3B8" />
    <path d="M4 12.5H12" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// 10. Open Status: Intake Vault
export const OpenStatusIcon: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="2.5" y="4" width="11" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5.5 4V3C5.5 2 6.5 1.5 8 1.5C9.5 1.5 10.5 2 10.5 3V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="8" cy="8.5" r="1.2" fill="currentColor" />
  </svg>
);

// 11. In Progress Status: Dual Orbiting Rings
export const InProgressStatusIcon: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.6" strokeDasharray="6 3" />
    <circle cx="8" cy="8" r="2" fill="currentColor" />
  </svg>
);

// 12. Resolved Status: Rosette Check Seal
export const ResolvedStatusIcon: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="8" cy="8" r="6" fill="#D1FAE5" stroke="#10B981" strokeWidth="1.5" />
    <path d="M5.5 8L7.2 9.7L10.5 6.4" stroke="#059669" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// 13. Closed Status: Locked Vault Seal
export const ClosedStatusIcon: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3" y="6" width="10" height="7.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5.5 6V4.5C5.5 3.1 6.6 2 8 2C9.4 2 10.5 3.1 10.5 4.5V6" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

// 14. Agent Role Badge Icon: Star Insignia Shield
export const AgentRoleIcon: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M8 1.5L2.5 4V8.5C2.5 12 5.5 14.2 8 15C10.5 14.2 13.5 12 13.5 8.5V4L8 1.5Z"
      fill="#F3E8FF"
      stroke="#9333EA"
      strokeWidth="1.4"
    />
    <polygon points="8,4.5 9,6.5 11.2,6.7 9.5,8.2 10,10.3 8,9.2 6,10.3 6.5,8.2 4.8,6.7 7,6.5" fill="#7E22CE" />
  </svg>
);

// 15. Reporter Role Badge Icon: Citizen Beacon
export const ReporterRoleIcon: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="8" cy="5" r="2.8" stroke="currentColor" strokeWidth="1.4" />
    <path d="M3 13.5C3 11 5.2 9.5 8 9.5C10.8 9.5 13 11 13 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

// 16. Raise Ticket Plus Icon: Ticket Stub
export const RaiseTicketIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M3 6C3 4.9 3.9 4 5 4H15C16.1 4 17 4.9 17 6V8.5C16.2 8.5 15.5 9.2 15.5 10C15.5 10.8 16.2 11.5 17 11.5V14C17 15.1 16.1 16 15 16H5C3.9 16 3 15.1 3 14V11.5C3.8 11.5 4.5 10.8 4.5 10C4.5 9.2 3.8 8.5 3 8.5V6Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M10 7.5V12.5M7.5 10H12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

// 17. Milestone Beacon: First Response SLA Trigger
export const MilestoneBeaconIcon: React.FC<IconProps> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="8" cy="8" r="6" fill="#EEF2FF" stroke="#4F46E5" strokeWidth="1.4" />
    <circle cx="8" cy="8" r="2.5" fill="#4F46E5" />
    <path d="M8 2V4M8 12V14M2 8H4M12 8H14" stroke="#818CF8" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// 18. Calendar Holiday Icon: Festive Sparkle Date
export const CalendarHolidayIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="2" y="3.5" width="12" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.4" />
    <path d="M2 6.5H14M5 2V4.5M11 2V4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="8" cy="10" r="1.5" fill="#F43F5E" />
  </svg>
);

// 19. Timezone Meridian Globe
export const TimezoneGlobeIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.4" />
    <ellipse cx="8" cy="8" rx="2.8" ry="6" stroke="currentColor" strokeWidth="1.2" />
    <path d="M2.5 8H13.5M3.5 5H12.5M3.5 11H12.5" stroke="currentColor" strokeWidth="1.1" />
  </svg>
);

// 20. Supersonic Paper Plane Comment Icon
export const SendPaperPlaneIcon: React.FC<IconProps> = ({ className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M14.5 1.5L7 9M14.5 1.5L10 14.5L7 9M14.5 1.5L1.5 6L7 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
