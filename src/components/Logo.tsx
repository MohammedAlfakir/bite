import { LogoGlyph } from './icons'
import { Link } from 'react-router'

/** Ink squircle with white burger glyph (design.md §7). */
export default function Logo() {
  return (
    <Link to="/" className="logo-squircle" aria-label="BITE home">
      <LogoGlyph />
    </Link>
  )
}
