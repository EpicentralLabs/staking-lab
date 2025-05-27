"use client"

export function FlowingBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4a85ff" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#4a85ff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#4a85ff" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Flowing curves */}
        <path
          d="M-100,200 Q200,100 400,200 T800,150 Q1000,100 1200,200 T1600,180"
          stroke="url(#flowGradient)"
          strokeWidth="2"
          fill="none"
          className="animate-pulse"
        />
        <path
          d="M-100,300 Q300,200 600,300 T1000,250 Q1200,200 1400,300 T1700,280"
          stroke="url(#flowGradient)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M-100,500 Q250,400 500,500 T900,450 Q1100,400 1300,500 T1600,480"
          stroke="url(#flowGradient)"
          strokeWidth="1"
          fill="none"
          opacity="0.5"
        />

        {/* Geometric patterns */}
        <circle cx="1200" cy="150" r="100" stroke="#4a85ff" strokeWidth="1" fill="none" opacity="0.2" />
        <circle cx="1200" cy="150" r="150" stroke="#4a85ff" strokeWidth="0.5" fill="none" opacity="0.1" />

        <circle cx="200" cy="600" r="80" stroke="#4a85ff" strokeWidth="1" fill="none" opacity="0.2" />
        <circle cx="200" cy="600" r="120" stroke="#4a85ff" strokeWidth="0.5" fill="none" opacity="0.1" />
      </svg>
    </div>
  )
}
