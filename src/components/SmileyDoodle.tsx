/**
 * Lighter-yellow smiley doodle drawn on the recipe panel below the wooden
 * board (design.md §10.4). Filled lighter circle, panel-yellow features.
 */
export default function SmileyDoodle({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <circle cx="100" cy="100" r="92" fill="#FFD045" />
      <circle cx="70" cy="82" r="11" fill="#F8C018" />
      <circle cx="130" cy="82" r="11" fill="#F8C018" />
      <path
        d="M58 122c12 22 30 32 42 32s30-10 42-32"
        stroke="#F8C018"
        strokeWidth="12"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )
}
