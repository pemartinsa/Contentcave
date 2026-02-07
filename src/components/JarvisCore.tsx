'use client'

export default function JarvisCore() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 flex items-center justify-center overflow-hidden">
      {/* Outer rotating ring */}
      <svg
        className="animate-rotate-slow absolute h-[600px] w-[600px] opacity-[0.04]"
        viewBox="0 0 400 400"
        fill="none"
      >
        <circle cx="200" cy="200" r="190" stroke="#00d2ff" strokeWidth="0.5" strokeDasharray="8 6" />
        <circle cx="200" cy="200" r="170" stroke="#00d2ff" strokeWidth="0.3" strokeDasharray="4 12" />
        {/* Tick marks */}
        {Array.from({ length: 60 }).map((_, i) => {
          const angle = (i * 6 * Math.PI) / 180
          const r1 = 185
          const r2 = i % 5 === 0 ? 175 : 180
          return (
            <line
              key={i}
              x1={200 + r1 * Math.cos(angle)}
              y1={200 + r1 * Math.sin(angle)}
              x2={200 + r2 * Math.cos(angle)}
              y2={200 + r2 * Math.sin(angle)}
              stroke="#00d2ff"
              strokeWidth={i % 5 === 0 ? '1' : '0.5'}
            />
          )
        })}
      </svg>

      {/* Inner rotating ring (reverse) */}
      <svg
        className="animate-rotate-reverse absolute h-[400px] w-[400px] opacity-[0.05]"
        viewBox="0 0 400 400"
        fill="none"
      >
        <circle cx="200" cy="200" r="150" stroke="#00d2ff" strokeWidth="0.5" strokeDasharray="12 4" />
        <circle cx="200" cy="200" r="130" stroke="#00d2ff" strokeWidth="0.3" />
        {/* Inner tick marks */}
        {Array.from({ length: 36 }).map((_, i) => {
          const angle = (i * 10 * Math.PI) / 180
          const r1 = 145
          const r2 = 135
          return (
            <line
              key={i}
              x1={200 + r1 * Math.cos(angle)}
              y1={200 + r1 * Math.sin(angle)}
              x2={200 + r2 * Math.cos(angle)}
              y2={200 + r2 * Math.sin(angle)}
              stroke="#00d2ff"
              strokeWidth="0.5"
            />
          )
        })}
      </svg>

      {/* Core heart - pulsing */}
      <div className="animate-heartbeat absolute">
        <svg
          className="h-[250px] w-[250px]"
          viewBox="0 0 200 200"
          fill="none"
        >
          {/* Center hexagon */}
          <polygon
            points="100,60 130,80 130,120 100,140 70,120 70,80"
            stroke="#00d2ff"
            strokeWidth="0.8"
            fill="none"
            opacity="0.4"
          />
          <polygon
            points="100,70 122,85 122,115 100,130 78,115 78,85"
            stroke="#00d2ff"
            strokeWidth="0.5"
            fill="rgba(0,210,255,0.02)"
            opacity="0.6"
          />

          {/* Radial lines from center */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = (i * 30 * Math.PI) / 180
            return (
              <line
                key={i}
                x1={100 + 20 * Math.cos(angle)}
                y1={100 + 20 * Math.sin(angle)}
                x2={100 + 50 * Math.cos(angle)}
                y2={100 + 50 * Math.sin(angle)}
                stroke="#00d2ff"
                strokeWidth="0.3"
                opacity="0.5"
              />
            )
          })}

          {/* Center dot */}
          <circle cx="100" cy="100" r="4" fill="#00d2ff" opacity="0.3" />
          <circle cx="100" cy="100" r="2" fill="#00d2ff" opacity="0.6" />

          {/* Arc segments */}
          <path
            d="M 100 55 A 45 45 0 0 1 145 100"
            stroke="#00d2ff"
            strokeWidth="1"
            fill="none"
            opacity="0.2"
            strokeLinecap="round"
          />
          <path
            d="M 100 145 A 45 45 0 0 1 55 100"
            stroke="#00d2ff"
            strokeWidth="1"
            fill="none"
            opacity="0.2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Scan line effect */}
      <div className="absolute h-full w-full max-w-[600px] max-h-[600px]">
        <div
          className="animate-scan absolute left-0 right-0 h-px opacity-0"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(0,210,255,0.15), transparent)',
          }}
        />
      </div>

      {/* Corner brackets */}
      <svg className="absolute h-[500px] w-[500px] opacity-[0.04]" viewBox="0 0 400 400" fill="none">
        {/* Top-left */}
        <path d="M 60 80 L 60 60 L 80 60" stroke="#00d2ff" strokeWidth="1" />
        {/* Top-right */}
        <path d="M 320 60 L 340 60 L 340 80" stroke="#00d2ff" strokeWidth="1" />
        {/* Bottom-left */}
        <path d="M 60 320 L 60 340 L 80 340" stroke="#00d2ff" strokeWidth="1" />
        {/* Bottom-right */}
        <path d="M 340 320 L 340 340 L 320 340" stroke="#00d2ff" strokeWidth="1" />
      </svg>
    </div>
  )
}
