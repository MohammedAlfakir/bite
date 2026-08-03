type Props = {
  /** flip horizontally */
  flipX?: boolean
  /** flip vertically */
  flipY?: boolean
  className?: string
}

/**
 * Hand-drawn yellow curved arrow with arrowhead (design.md §4.7).
 * 4px-equivalent organic single-bezier loop, slow float handled by parent.
 */
export default function DoodleArrow({ flipX = false, flipY = false, className = '' }: Props) {
  return (
    <svg
      viewBox="0 0 220 120"
      fill="none"
      className={className}
      style={{ transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})` }}
      aria-hidden="true"
    >
      <path
        d="M14 18 C 60 10, 120 22, 150 52 C 172 74, 168 96, 140 100 C 116 103, 104 88, 116 74 C 126 62, 150 62, 168 74 C 184 84, 194 96, 200 106"
        stroke="#FCC419"
        strokeWidth="5"
        strokeLinecap="round"
      />
      {/* arrowhead */}
      <path
        d="M184 108 L 202 110 L 194 92"
        stroke="#FCC419"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
