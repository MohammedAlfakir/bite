/**
 * Eco badge — ~260px scalloped green stamp (design.md §7 / §10.4).
 * Ring text "100% ORGANIC PRODUCT" (top arc) / "VEGAN FRIENDLY" (bottom arc),
 * star separators, white inner circle, green leaf glyph, grunge drips.
 */
function scallopPath(cx: number, cy: number, r: number, teeth: number, amp: number) {
  const pts: string[] = []
  const steps = teeth * 2
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2 - Math.PI / 2
    const rr = r + (i % 2 === 0 ? amp : -amp)
    const x = cx + rr * Math.cos(a)
    const y = cy + rr * Math.sin(a)
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  return pts.join(' ') + ' Z'
}

export default function EcoBadge({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 260" className={className} role="img" aria-label="100% organic product, vegan friendly">
      {/* scalloped outer edge */}
      <path d={scallopPath(130, 130, 122, 28, 7)} fill="#326A3A" />
      {/* rough inner ring */}
      <circle cx="130" cy="130" r="104" fill="none" stroke="#7FB069" strokeWidth="2" opacity="0.7" />
      {/* ring text paths */}
      <defs>
        <path id="ecoArcTop" d="M130 130 m -88 0 a 88 88 0 1 1 176 0 a 88 88 0 1 1 -176 0" fill="none" />
      </defs>
      <text
        fill="#ffffff"
        fontFamily="Anton, Impact, sans-serif"
        fontSize="21"
        letterSpacing="2.5"
      >
        <textPath href="#ecoArcTop" startOffset="25%" textAnchor="middle">
          100% ORGANIC PRODUCT
        </textPath>
      </text>
      <text
        fill="#ffffff"
        fontFamily="Anton, Impact, sans-serif"
        fontSize="21"
        letterSpacing="2.5"
      >
        <textPath href="#ecoArcTop" startOffset="76.5%" textAnchor="middle">
          VEGAN FRIENDLY
        </textPath>
      </text>
      {/* star separators */}
      <path d="M40 128 l2.4 5.2 5.2 2.4 -5.2 2.4 -2.4 5.2 -2.4 -5.2 -5.2 -2.4 5.2 -2.4 Z" fill="#ffffff" />
      <path d="M220 128 l2.4 5.2 5.2 2.4 -5.2 2.4 -2.4 5.2 -2.4 -5.2 -5.2 -2.4 5.2 -2.4 Z" fill="#ffffff" />
      {/* white inner circle */}
      <circle cx="130" cy="130" r="66" fill="#ffffff" />
      {/* green leaf glyph */}
      <path
        d="M130 158c-26 0-44-16-46-40 24-2 42 8 46 28 4-20 22-30 46-28-2 24-20 40-46 40Z"
        fill="#326A3A"
      />
      <path d="M130 158c0-18 0-30 0-44" stroke="#7FB069" strokeWidth="3" strokeLinecap="round" />
      {/* grunge drips */}
      <path d="M96 190c2 8-2 14-5 20M130 196c1 9-1 16-3 22M164 190c3 7 1 13-1 19" stroke="#326A3A" strokeWidth="3" strokeLinecap="round" opacity="0.55" fill="none" />
      <circle cx="130" cy="130" r="60" fill="none" stroke="#326A3A" strokeWidth="1.6" opacity="0.35" />
    </svg>
  )
}
