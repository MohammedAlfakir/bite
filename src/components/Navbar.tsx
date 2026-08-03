import Logo from './Logo'
import PillButton from './PillButton'

/**
 * Nav row — in normal flow at page top (absolute, NOT sticky), mirrored at the
 * page bottom inside the footer. Three items: Menu pill (left), logo (dead
 * center), Order pill (right). home.md §1.
 * No intro tween here — a transform animation on the pills conflicts with the
 * CSS transform transition and can leave them stuck offset (clipped nav).
 */
export default function Navbar({ id = 'top' }: { id?: string; intro?: boolean }) {
  return (
    <nav className="nav-row" aria-label={id === 'top' ? 'Primary' : 'Footer'}>
      <PillButton variant="menu" />
      <Logo />
      <PillButton variant="order" />
    </nav>
  )
}
