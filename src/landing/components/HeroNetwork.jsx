import React from 'react';
import { 
  BarChart3, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  FileText, 
  ShieldAlert, 
  Truck, 
  Package, 
  Crosshair, 
  GitFork, 
  Boxes 
} from 'lucide-react';

export default function HeroNetwork() {
  const coreX = 350;
  const coreY = 320;
  const orbitRadius = 240;

  // 11 modules dynamically spaced around the 360-degree orbit
  const rawModules = [
    { id: 'today', name: 'Today', icon: Clock, route: '/today' },
    { id: 'future', name: 'Future', icon: TrendingUp, route: '/future' },
    { id: 'risks', name: 'Risks', icon: AlertTriangle, route: '/risks' },
    { id: 'report', name: 'Report', icon: FileText, route: '/report' },
    { id: 'exceptions', name: 'Exceptions', icon: ShieldAlert, route: '/exceptions' },
    { id: 'dispatch', name: 'Dispatch', icon: Truck, route: '/dispatch' },
    { id: 'packing', name: 'Packing', icon: Package, route: '/packing' },
    { id: 'picking', name: 'Picking', icon: Crosshair, route: '/picking' },
    { id: 'allocation', name: 'Allocation', icon: GitFork, route: '/allocation' },
    { id: 'inventory', name: 'Inventory', icon: Boxes, route: '/inventory' },
    { id: 'overview', name: 'Overview', icon: BarChart3, route: '/dashboard' },
  ];

  const total = rawModules.length;
  const modules = rawModules.map((mod, index) => {
    // Dynamic angular calculation: angle = index * (360 / total) - 90deg (starting from top)
    const angle = (index * 360) / total - 90;
    return { ...mod, angle };
  });

  // Glowing green particles along the orbital ring path
  const particleAngles = [0, 90, 180, 270];

  return (
    <div className="inv-hero-network-right">
      <svg
        className="inv-hero-network-svg"
        viewBox="0 0 700 640"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="blackHoleCoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#10B981" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>

          <filter id="greenGlowEffect" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="particleGlowEffect" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. OrbitRing: Fixed background orbit circle & accent ring */}
        <circle
          cx={coreX}
          cy={coreY}
          r={orbitRadius}
          stroke="rgba(16, 185, 129, 0.2)"
          strokeWidth="1.5"
          strokeDasharray="6 6"
        />
        <circle
          cx={coreX}
          cy={coreY}
          r={160}
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="1"
          strokeDasharray="4 8"
        />

        {/* 2. OrbitSystem: Rotates 360 degrees around center (350, 320) */}
        <g className="hero-orbit-rotation" style={{ transformOrigin: `${coreX}px ${coreY}px` }}>
          
          {/* Green Glowing Particles along the orbit path */}
          {particleAngles.map((pAngle, idx) => {
            const pRad = (pAngle * Math.PI) / 180;
            const px = coreX + orbitRadius * Math.cos(pRad);
            const py = coreY + orbitRadius * Math.sin(pRad);

            return (
              <g key={`particle-${idx}`} transform={`translate(${px}, ${py})`}>
                <circle r="4" fill="#10B981" filter="url(#particleGlowEffect)" />
                <circle r="1.8" fill="#FFFFFF" />
              </g>
            );
          })}

          {/* 11 Orbiting Module Cards */}
          {modules.map((mod) => {
            const rad = (mod.angle * Math.PI) / 180;
            const x = coreX + orbitRadius * Math.cos(rad);
            const y = coreY + orbitRadius * Math.sin(rad);
            const Icon = mod.icon;

            return (
              <g key={`orbit-${mod.id}`} transform={`translate(${x}, ${y})`}>
                {/* Counter-rotate each card by -360 degrees so visual orientation is 100% UPRIGHT & READABLE */}
                <g className="hero-node-counter-rotate" style={{ transformOrigin: '0px 0px' }}>
                  <g className="hero-card-inner">
                    {/* Dark Card Frame */}
                    <rect
                      x="-65"
                      y="-18"
                      width="130"
                      height="36"
                      rx="8"
                      fill="#0A0A0A"
                      stroke="#262626"
                      strokeWidth="1.2"
                      className="hero-card-rect"
                    />
                    {/* Icon Box */}
                    <rect
                      x="-57"
                      y="-11"
                      width="22"
                      height="22"
                      rx="4"
                      fill="rgba(255, 255, 255, 0.06)"
                    />
                    <g transform="translate(-53, -7)">
                      <Icon size={14} color="#10B981" />
                    </g>
                    {/* Text: 100% Upright, Readable Native SVG Text */}
                    <text
                      x="-27"
                      y="1"
                      fill="#FFFFFF"
                      fontSize="12.5"
                      fontWeight="700"
                      fontFamily="Inter, system-ui, -apple-system, sans-serif"
                      dominantBaseline="middle"
                    >
                      {mod.name}
                    </text>
                  </g>
                </g>
              </g>
            );
          })}
        </g>

        {/* 3. FixedCenter: STATIONARY CENTRAL INVINTELL CORE */}
        <g transform={`translate(${coreX}, ${coreY})`} className="hero-center-circle-group">
          {/* Ambient Glow */}
          <circle cx="0" cy="0" r="108" fill="url(#blackHoleCoreGlow)" />
          {/* Dark Border Ring */}
          <circle cx="0" cy="0" r="76" fill="#000000" stroke="rgba(16, 185, 129, 0.25)" strokeWidth="1" />
          {/* Main Core Circle */}
          <circle
            cx="0"
            cy="0"
            r="62"
            fill="#000000"
            stroke="#10B981"
            strokeWidth="1.8"
            filter="url(#greenGlowEffect)"
          />
          {/* Centered Typography: INVINTELL */}
          <text
            x="0"
            y="1"
            textAnchor="middle"
            dominantBaseline="middle"
            fontFamily="Inter, system-ui, -apple-system, sans-serif"
            fontSize="15.5"
            fontWeight="900"
            letterSpacing="1.5"
          >
            <tspan fill="#FFFFFF">INVI</tspan>
            <tspan fill="#10B981">NTELL</tspan>
          </text>
        </g>
      </svg>
    </div>
  );
}

