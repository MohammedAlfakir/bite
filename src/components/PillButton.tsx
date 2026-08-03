import { useEffect, useRef } from 'react'
import { BagIcon, MenuIcon } from './icons'
import { useCart } from '@/lib/cart'
import { gsap, prefersReducedMotion } from '@/lib/gsap'
import { Link } from 'react-router'

type Props = {
  variant: 'menu' | 'order'
}

/** Yellow pill button (design.md §7): Menu = badge left, Order = badge right.
 *  Reference pills have a big ink rounded-square badge holding the icon.
 *  Menu links to /menu, Order links to /order. The Order pill carries a live
 *  item-count chip that pops whenever something is added. */
export default function PillButton({ variant }: Props) {
  const { count, lastAdded } = useCart()
  const countRef = useRef<HTMLSpanElement>(null)

  // pop the count chip on every add
  useEffect(() => {
    if (!lastAdded || variant !== 'order' || prefersReducedMotion()) return
    const el = countRef.current
    if (!el) return
    gsap.fromTo(el, { scale: 0.3, rotate: -25 }, { scale: 1, rotate: 0, duration: 0.55, ease: 'back.out(3.2)' })
  }, [lastAdded, count, variant])

  const label = variant === 'menu' ? 'Menu' : 'Order'

  return (
    <Link
      to={variant === 'menu' ? '/menu' : '/order'}
      className={`pill-btn ${variant}`}
      aria-label={variant === 'order' && count ? `${label}, ${count} items in your order` : label}
    >
      {variant === 'menu' && (
        <span className="pill-badge">
          <MenuIcon />
        </span>
      )}
      <span>{label}</span>
      {variant === 'order' && (
        <>
          {count > 0 && (
            <span ref={countRef} className="pill-count" aria-hidden="true">
              {count}
            </span>
          )}
          <span className="pill-badge">
            <BagIcon />
          </span>
        </>
      )}
    </Link>
  )
}
