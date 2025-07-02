// components/StudyHubLogo.jsx
type StudyHubLogoProps = {
  className?: string;
  size?: "small" | "default" | "large";
};

export function StudyHubLogo({ className = "", size = "default" }: StudyHubLogoProps) {
  const dimensions = {
    small: "w-8 h-8",
    default: "w-48 h-14",
    large: "w-64 h-20"
  }

  return (
    <div className={`${dimensions[size]} ${className}`}>
      <svg viewBox="0 0 200 60" className="w-full h-full">
        {/* Background circle for the icon */}
        <circle cx="30" cy="30" r="25" fill="currentColor" opacity="0.1"/>
        
        {/* Main hub/network icon */}
        <g transform="translate(30, 30)">
          {/* Central hub */}
          <circle cx="0" cy="0" r="4" fill="currentColor"/>
          
          {/* Connected nodes representing students/collaboration */}
          <circle cx="-12" cy="-8" r="3" fill="currentColor" opacity="0.8"/>
          <circle cx="12" cy="-8" r="3" fill="currentColor" opacity="0.8"/>
          <circle cx="-8" cy="10" r="3" fill="currentColor" opacity="0.8"/>
          <circle cx="8" cy="10" r="3" fill="currentColor" opacity="0.8"/>
          
          {/* Connection lines */}
          <line x1="0" y1="0" x2="-12" y2="-8" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
          <line x1="0" y1="0" x2="12" y2="-8" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
          <line x1="0" y1="0" x2="-8" y2="10" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
          <line x1="0" y1="0" x2="8" y2="10" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
          
          {/* Study/book element integrated */}
          <rect x="-2" y="-2" width="4" height="4" fill="white" rx="0.5"/>
          <line x1="-1.5" y1="-0.5" x2="1.5" y2="-0.5" stroke="currentColor" strokeWidth="0.5"/>
          <line x1="-1.5" y1="0.5" x2="1.5" y2="0.5" stroke="currentColor" strokeWidth="0.5"/>
        </g>
        
        {/* StudyHub text */}
        <text x="65" y="25" fontFamily="system-ui, -apple-system, sans-serif" fontSize="20" fontWeight="700" fill="currentColor">
          Study<tspan className="text-purple-400">Hub</tspan>
        </text>
        
        {/* Tagline - only show on default and large sizes */}
        {size !== "small" && (
          <text x="65" y="40" fontFamily="system-ui, -apple-system, sans-serif" fontSize="9" fontWeight="500" fill="currentColor" opacity="0.7">
            Connect. Collaborate. Conquer.
          </text>
        )}
        
        {/* Tech accent elements - only show on larger sizes */}
        {size !== "small" && (
          <g opacity="0.3">
            <text x="170" y="20" fontFamily="monospace" fontSize="12" fill="currentColor">&lt;/&gt;</text>
            <circle cx="175" cy="35" r="1" fill="currentColor"/>
            <circle cx="180" cy="35" r="1" fill="currentColor" opacity="0.7"/>
            <circle cx="185" cy="35" r="1" fill="currentColor" opacity="0.4"/>
          </g>
        )}
      </svg>
    </div>
  )
}

// Icon-only version for navbar/favicon
export function StudyHubIcon({ className = "", size = 32 }) {
  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg viewBox="0 0 60 60" className="w-full h-full">
        {/* Background circle */}
        <circle cx="30" cy="30" r="25" fill="currentColor" opacity="0.1"/>
        
        {/* Main hub/network icon */}
        <g transform="translate(30, 30)">
          {/* Central hub */}
          <circle cx="0" cy="0" r="4" fill="currentColor"/>
          
          {/* Connected nodes */}
          <circle cx="-12" cy="-8" r="3" fill="currentColor" opacity="0.8"/>
          <circle cx="12" cy="-8" r="3" fill="currentColor" opacity="0.8"/>
          <circle cx="-8" cy="10" r="3" fill="currentColor" opacity="0.8"/>
          <circle cx="8" cy="10" r="3" fill="currentColor" opacity="0.8"/>
          
          {/* Connection lines */}
          <line x1="0" y1="0" x2="-12" y2="-8" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
          <line x1="0" y1="0" x2="12" y2="-8" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
          <line x1="0" y1="0" x2="-8" y2="10" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
          <line x1="0" y1="0" x2="8" y2="10" stroke="currentColor" strokeWidth="2" opacity="0.6"/>
          
          {/* Study/book element */}
          <rect x="-2" y="-2" width="4" height="4" fill="white" rx="0.5"/>
          <line x1="-1.5" y1="-0.5" x2="1.5" y2="-0.5" stroke="currentColor" strokeWidth="0.5"/>
          <line x1="-1.5" y1="0.5" x2="1.5" y2="0.5" stroke="currentColor" strokeWidth="0.5"/>
        </g>
      </svg>
    </div>
  )
}
