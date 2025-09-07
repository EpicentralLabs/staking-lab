"use client"

export function FlowingBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <svg
        className="absolute left-1/2 top-0 min-w-[200vw] w-[200vw] h-full -translate-x-1/2"
        viewBox="0 0 2880 900"
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

        {/* Flowing curves - expanded for 2880 width */}
        <path
          d="M-200,200 Q400,100 800,200 T1600,150 Q2000,100 2400,200 T3200,180"
          stroke="url(#flowGradient)"
          strokeWidth="2"
          fill="none"
          className="animate-pulse"
        />
        <path
          d="M-200,300 Q600,200 1200,300 T2000,250 Q2400,200 2800,300 T3400,280"
          stroke="url(#flowGradient)"
          strokeWidth="1.5"
          fill="none"
          opacity="0.7"
        />
        <path
          d="M-200,500 Q500,400 1000,500 T1800,450 Q2200,400 2600,500 T3200,480"
          stroke="url(#flowGradient)"
          strokeWidth="1"
          fill="none"
          opacity="0.5"
        />

        {/* Geometric patterns - expanded for 2880 width */}
        <circle cx="2400" cy="150" r="100" stroke="#4a85ff" strokeWidth="1" fill="none" opacity="0.2" />
        <circle cx="2400" cy="150" r="150" stroke="#4a85ff" strokeWidth="0.5" fill="none" opacity="0.1" />

        <circle cx="400" cy="600" r="80" stroke="#4a85ff" strokeWidth="1" fill="none" opacity="0.2" />
        <circle cx="400" cy="600" r="120" stroke="#4a85ff" strokeWidth="0.5" fill="none" opacity="0.1" />
      </svg>
    </div>
  )
}