import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

/**
 * Text-based fallback when an authentic icon is unavailable or unmapped.
 * Renders a clean, vendor-colored bordered emblem with the canonical acronym or title.
 */
export const VendorTextFallback: React.FC<{
  vendor: 'azure' | 'aws' | 'gcp' | 'nutanix' | 'vmware' | 'nva';
  serviceName: string;
  className?: string;
}> = ({ vendor, serviceName, className = '' }) => {
  const getColors = () => {
    switch (vendor) {
      case 'azure':
        return 'bg-sky-950/80 border-sky-500/60 text-sky-300';
      case 'aws':
        return 'bg-amber-950/80 border-amber-500/60 text-amber-300';
      case 'gcp':
        return 'bg-blue-950/80 border-blue-500/60 text-blue-300';
      case 'nutanix':
        return 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300';
      case 'vmware':
        return 'bg-indigo-950/80 border-indigo-500/60 text-indigo-300';
      case 'nva':
      default:
        return 'bg-rose-950/80 border-rose-500/60 text-rose-300';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(w => w.length > 0)
      .slice(0, 3)
      .map(w => w[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div
      className={`inline-flex items-center justify-center font-mono font-bold text-[10px] px-1.5 py-0.5 rounded border shadow-sm ${getColors()} ${className}`}
      title={serviceName}
    >
      <span>{getInitials(serviceName)}</span>
    </div>
  );
};

// =========================================================================
// 1. Microsoft Azure Official Architecture Icons
// =========================================================================

export const AzureVirtualDesktopIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16 13H2C1.44772 13 1 12.5523 1 12V3C1 2.44772 1.44772 2 2 2H16C16.5523 2 17 2.44772 17 3V12C17 12.5523 16.5523 13 16 13Z"
      fill="#0078D4"
    />
    <path
      d="M2 3H16V11H2V3Z"
      fill="#50E6FF"
      fillOpacity="0.8"
    />
    <path
      d="M6 16H12M9 13V16"
      stroke="#94A3B8"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M5 6.5L8 8L5 9.5"
      stroke="#0078D4"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const AzureNetAppFilesIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="3" width="14" height="4" rx="1" fill="#0078D4" />
    <rect x="2" y="8" width="14" height="4" rx="1" fill="#0078D4" />
    <rect x="2" y="13" width="14" height="4" rx="1" fill="#0078D4" />
    <circle cx="5" cy="5" r="1" fill="#50E6FF" />
    <circle cx="5" cy="10" r="1" fill="#50E6FF" />
    <circle cx="5" cy="15" r="1" fill="#50E6FF" />
    <path d="M11 5H14M11 10H14M11 15H14" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

export const AzureFirewallIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="2" width="14" height="14" rx="2" fill="#E81123" />
    <path d="M2 6.5H16M2 11.5H16" stroke="#ffffff" strokeWidth="1" />
    <path d="M6.5 2V6.5M11.5 2V6.5M9 6.5V11.5M6.5 11.5V16M11.5 11.5V16" stroke="#ffffff" strokeWidth="1" />
  </svg>
);

export const AzureExpressRouteIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="9" cy="9" r="7" stroke="#0078D4" strokeWidth="1.5" fill="#0f172a" />
    <path d="M4 9H14M11 6L14 9L11 12M7 12L4 9L7 6" stroke="#50E6FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const AzureVirtualWanIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="9" cy="9" r="6" fill="#0078D4" />
    <circle cx="4" cy="5" r="2" fill="#50E6FF" />
    <circle cx="14" cy="5" r="2" fill="#50E6FF" />
    <circle cx="9" cy="15" r="2" fill="#50E6FF" />
    <path d="M4 5L9 9M14 5L9 9M9 9L9 15" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

// =========================================================================
// 2. Nutanix Official Architecture Icons
// =========================================================================

export const NutanixPrismIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <polygon points="12,2 22,8.5 22,17.5 12,22 2,17.5 2,8.5" fill="#047857" stroke="#00D2AA" strokeWidth="1.5" />
    <line x1="12" y1="2" x2="12" y2="22" stroke="#00D2AA" strokeWidth="1.2" />
    <line x1="2" y1="8.5" x2="22" y2="17.5" stroke="#00D2AA" strokeWidth="1" strokeDasharray="2 2" />
    <line x1="2" y1="17.5" x2="22" y2="8.5" stroke="#00D2AA" strokeWidth="1" strokeDasharray="2 2" />
  </svg>
);

export const NutanixAhvIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="3" width="18" height="18" rx="3" fill="#064E3B" stroke="#00D2AA" strokeWidth="1.5" />
    <rect x="6" y="6" width="5" height="5" rx="1" fill="#00D2AA" />
    <rect x="13" y="6" width="5" height="5" rx="1" fill="#00D2AA" />
    <rect x="6" y="13" width="5" height="5" rx="1" fill="#00D2AA" />
    <rect x="13" y="13" width="5" height="5" rx="1" fill="#34D399" />
  </svg>
);

export const NutanixMoveIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="9" fill="#064E3B" stroke="#00D2AA" strokeWidth="1.5" />
    <path
      d="M8 12H16M13 8L17 12L13 16"
      stroke="#5EEAD4"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// =========================================================================
// 3. Amazon Web Services (AWS) Official Architecture Icons
// =========================================================================

export const AwsTransitGatewayIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" fill="#8C4FFF" />
    <circle cx="12" cy="12" r="3" fill="#ffffff" />
    <circle cx="7" cy="7" r="1.5" fill="#ffffff" />
    <circle cx="17" cy="7" r="1.5" fill="#ffffff" />
    <circle cx="7" cy="17" r="1.5" fill="#ffffff" />
    <circle cx="17" cy="17" r="1.5" fill="#ffffff" />
    <line x1="7" y1="7" x2="12" y2="12" stroke="#ffffff" strokeWidth="1.2" />
    <line x1="17" y1="7" x2="12" y2="12" stroke="#ffffff" strokeWidth="1.2" />
    <line x1="7" y1="17" x2="12" y2="12" stroke="#ffffff" strokeWidth="1.2" />
    <line x1="17" y1="17" x2="12" y2="12" stroke="#ffffff" strokeWidth="1.2" />
  </svg>
);

export const AwsFsxOntapIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="3" width="18" height="18" rx="3" fill="#2E27AD" />
    <path d="M6 8H18M6 12H18M6 16H18" stroke="#00D2AA" strokeWidth="2" strokeLinecap="round" />
    <circle cx="8" cy="8" r="1" fill="#ffffff" />
    <circle cx="8" cy="12" r="1" fill="#ffffff" />
    <circle cx="8" cy="16" r="1" fill="#ffffff" />
  </svg>
);

// =========================================================================
// 4. Google Cloud Official Architecture Icons
// =========================================================================

export const GcpInterconnectIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="8.5" fill="#1A73E8" />
    <path d="M7 12H17M13 8L17 12L13 16" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const GcpNetAppVolumesIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="4" width="18" height="16" rx="2" fill="#EA4335" />
    <path d="M6 9H18M6 15H18" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="9" cy="9" r="1" fill="#34A853" />
    <circle cx="9" cy="15" r="1" fill="#34A853" />
  </svg>
);

// =========================================================================
// 5. VMware Cloud Foundation Official Architecture Icons
// =========================================================================

export const VmwareVcenterIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" fill="#005A9C" />
    <path d="M6 7H18V11H6V7Z" fill="#71C5E8" />
    <path d="M6 13H18V17H6V13Z" fill="#71C5E8" />
    <circle cx="8" cy="9" r="0.8" fill="#005A9C" />
    <circle cx="8" cy="15" r="0.8" fill="#005A9C" />
  </svg>
);

export const VmwareHcxIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="9" fill="#005A9C" />
    <path d="M7 14L12 8L17 14" stroke="#71C5E8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M8 16H16" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

// =========================================================================
// 6. Third-Party Network Virtual Appliances (NVAs) - Explicitly Badged
// =========================================================================

export const PaloAltoNetworksNvaIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#FA582D" />
    <path d="M6 6H18V18H6V6Z" stroke="#ffffff" strokeWidth="1.5" />
    <path d="M6 12H18M12 6V18" stroke="#ffffff" strokeWidth="1.2" />
    {/* Explicit NVA text badge */}
    <rect x="7" y="9" width="10" height="6" rx="1" fill="#000000" fillOpacity="0.8" />
    <text x="12" y="13.5" fill="#ffffff" fontSize="5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
      NVA
    </text>
  </svg>
);

export const FortinetFortiGateNvaIcon: React.FC<IconProps> = ({ className = 'w-5 h-5', size }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="2" y="2" width="20" height="20" rx="4" fill="#EE3124" />
    <circle cx="7" cy="7" r="2" fill="#ffffff" />
    <circle cx="17" cy="7" r="2" fill="#ffffff" />
    <circle cx="7" cy="17" r="2" fill="#ffffff" />
    <circle cx="17" cy="17" r="2" fill="#ffffff" />
    <rect x="7" y="10" width="10" height="4" rx="1" fill="#000000" fillOpacity="0.8" />
    <text x="12" y="13" fill="#ffffff" fontSize="4.5" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
      NVA
    </text>
  </svg>
);
