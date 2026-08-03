import { useRef } from 'react'
import Navbar from './Navbar'
import OrderNowButton from './OrderNowButton'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'

const HEADLINE = 'ORDER NOW'

/**
 * Footer CTA (home.md §7): "ORDER NOW" headline, yellow arch running flush to
 * the page bottom, hero burger reused in front, mirrored bottom nav.
 */
export default function Footer() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const root = ref.current!
      const chars = root.querySelectorAll('.footer-headline .char')
      const burger = root.querySelector('.footer-burger img')
      const floatWrap = root.querySelector('.footer-burger-float')
      const nav = root.querySelector('.footer-stage .nav-row')

      if (prefersReducedMotion()) return

      // headline character stagger-in on scroll
      gsap.from(chars, {
        y: 60,
        opacity: 0,
        stagger: 0.03,
        duration: 0.9,
        ease: 'power4.out',
        scrollTrigger: { trigger: root, start: 'top 80%' },
      })
      // burger rises then idle-floats like the hero
      gsap.from(burger, {
        y: 120,
        scale: 0.92,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: root, start: 'top 80%' },
        onComplete: () => {
          gsap.to(floatWrap, {
            y: 15,
            rotation: 2,
            duration: 3,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
          })
        },
      })
      // bottom nav fade + rise — anchored to the nav element itself, not the
      // footer root: 'top 10%' on the root is geometrically unreachable on
      // short pages (small screens), which left the nav frozen at opacity 0.
      gsap.from(nav, {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out',
        scrollTrigger: { trigger: nav, start: 'top bottom' },
      })
    },
    { scope: ref },
  )

  return (
    <footer ref={ref} className="footer-stage">
      <h2 className="footer-headline display-type" aria-label={HEADLINE}>
        {HEADLINE.split('').map((c, i) => (
          <span key={i} className="char inline-block" aria-hidden="true">
            {c === ' ' ? '\u00A0' : c}
          </span>
        ))}
      </h2>
      <div className="footer-arch" aria-hidden="true" />
      <div className="footer-burger">
        <div className="footer-burger-float">
          <img src="/burger-hero.png" alt="Cheeseburger with sesame bun" width={1536} height={1536} loading="lazy" />
        </div>
      </div>
      <OrderNowButton />
      <Navbar id="bottom" intro={false} />
    </footer>
  )
}
