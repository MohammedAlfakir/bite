import { useRef } from 'react'
import { ArrowRightIcon } from './icons'
import { useCart } from '@/lib/cart'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'
import { Link } from 'react-router'

/**
 * Big centered "ORDER NOW" CTA sitting at the bottom of the footer's ORDER NOW
 * stage, just above the mirrored nav. Ink pill with a cream label and a yellow
 * arrow badge — the inverse of the nav pills so it reads as the primary action
 * against the yellow arch.
 *
 * Animation: rises + pops in on scroll, breathes on a slow loop, and on hover
 * the arrow badge slides while a yellow sheen sweeps across the pill.
 */
export default function OrderNowButton() {
  const ref = useRef<HTMLAnchorElement>(null)
  const { count } = useCart()

  useGSAP(
    () => {
      const el = ref.current!
      if (prefersReducedMotion()) return

      gsap.from(el, {
        y: 46,
        scale: 0.86,
        opacity: 0,
        duration: 0.8,
        ease: 'back.out(1.7)',
        scrollTrigger: { trigger: el, start: 'top 95%' },
      })

      // Keep drawing the eye with a pulsing HALO rather than scaling the button
      // itself — animating the button would leave the click target permanently
      // in motion, which makes it fiddly to hit (and never "stable").
      gsap.to(el.querySelector('.order-now-halo'), {
        opacity: 0.55,
        scale: 1.16,
        duration: 1.9,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: 1,
      })
    },
    { scope: ref },
  )

  const onEnter = () => {
    if (prefersReducedMotion()) return
    const el = ref.current!
    gsap.to(el.querySelector('.order-now-badge'), { x: 6, rotate: 8, duration: 0.3, ease: 'back.out(3)' })
    gsap.fromTo(
      el.querySelector('.order-now-sheen'),
      { xPercent: -140 },
      { xPercent: 140, duration: 0.75, ease: 'power2.inOut' },
    )
  }

  const onLeave = () => {
    if (prefersReducedMotion()) return
    gsap.to(ref.current!.querySelector('.order-now-badge'), { x: 0, rotate: 0, duration: 0.3, ease: 'power3.out' })
  }

  return (
    <div className="order-now-wrap">
      {/* pulsing halo sits behind the button and is not part of the hit target */}
      <span className="order-now-halo" aria-hidden="true" />
      <Link
        ref={ref}
        to="/menu"
        className="order-now"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        aria-label={count ? `Order now — browse the menu, ${count} items in your order` : 'Order now — browse the menu'}
      >
        <span className="order-now-sheen" aria-hidden="true" />
        <span className="order-now-label display-type">ORDER NOW</span>
        <span className="order-now-badge">
          <ArrowRightIcon />
        </span>
      </Link>
    </div>
  )
}
