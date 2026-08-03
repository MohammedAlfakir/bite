import { useRef } from 'react'
import { MENU, money, useCart } from '@/lib/cart'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'
import { BagIcon, PlusIcon } from '@/components/icons'
import DoodleArrow from '@/components/DoodleArrow'
import RibbonBand from '@/components/RibbonBand'
import { Link } from 'react-router'

/**
 * /menu — the three burgers the hero selector swaps between, as a real page so
 * it uses the normal document scroll (and Lenis smooth scrolling) like Home.
 *
 * Animation: yellow arch grows from the floor, headline chars stagger up,
 * cards pop in on a stagger and settle at alternating tilts, doodles drift.
 */
export default function Menu() {
  const ref = useRef<HTMLDivElement>(null)
  const { add, count } = useCart()

  useGSAP(
    () => {
      const root = ref.current!
      const cards = root.querySelectorAll('.menu-card')

      // cards always rest at their alternating tilt, even with reduced motion
      cards.forEach((el, i) => gsap.set(el, { rotate: i % 2 ? 2.2 : -2.2 }))
      if (prefersReducedMotion()) return

      const tl = gsap.timeline({ delay: 0.15 })
      tl.from(root.querySelector('.page-arch'), {
        scaleY: 0.25,
        opacity: 0,
        transformOrigin: '50% 100%',
        duration: 0.95,
        ease: 'expo.out',
      }, 0)
        .from(root.querySelectorAll('.page-title .char'), {
          yPercent: 130,
          rotate: 6,
          opacity: 0,
          duration: 0.8,
          stagger: 0.035,
          ease: 'power4.out',
        }, 0.1)
        .from(root.querySelectorAll('.page-intro'), {
          y: 26,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out',
        }, 0.3)

      // cards reveal on scroll, keeping their resting tilt
      cards.forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 90, opacity: 0, scale: 0.88, rotate: 0 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            rotate: i % 2 ? 2.2 : -2.2,
            duration: 0.8,
            delay: i * 0.08,
            ease: 'back.out(1.5)',
            scrollTrigger: { trigger: el, start: 'top 88%' },
          },
        )
      })

      // doodle + smiley idle drift
      root.querySelectorAll('.page-doodle').forEach((d, i) => {
        gsap.to(d, { y: i % 2 ? -12 : 12, duration: 4 + i * 0.5, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      })

      // mouse parallax on the cards (subtle depth, like the recipe layers)
      const quicks = [...cards].map((el) => gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' }))
      const onMove = (e: MouseEvent) => {
        const dx = e.clientX / window.innerWidth - 0.5
        quicks.forEach((q, i) => q(dx * (6 + i * 4)))
      }
      window.addEventListener('mousemove', onMove)
      return () => window.removeEventListener('mousemove', onMove)
    },
    { scope: ref },
  )

  const onAdd = (id: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
    add(id)
    if (prefersReducedMotion()) return
    const card = e.currentTarget.closest('.menu-card')
    gsap.fromTo(card, { scale: 1 }, { scale: 1.05, duration: 0.16, ease: 'power2.out', yoyo: true, repeat: 1 })
    const img = card?.querySelector('.menu-card-imgwrap img')
    if (img) {
      gsap.fromTo(
        img,
        { rotate: 0, y: 0 },
        { rotate: 14, y: -16, duration: 0.28, ease: 'back.out(3)', yoyo: true, repeat: 1 },
      )
    }
  }

  const HEADLINE = 'THE MENU'

  return (
    <div ref={ref} className="page-stage">
      <div className="page-arch" aria-hidden="true" />

      <header className="page-head">
        <h1 className="page-title display-type" aria-label={HEADLINE}>
          {HEADLINE.split('').map((c, i) => (
            <span key={i} className="char inline-block" aria-hidden="true">
              {c === ' ' ? ' ' : c}
            </span>
          ))}
        </h1>
        <p className="page-sub page-intro">
          Three burgers. Flame-grilled, stacked by hand, served with zero chill. Pick your bite.
        </p>
        <div className="page-doodle page-doodle-left" aria-hidden="true">
          <DoodleArrow flipX />
        </div>
        <div className="page-doodle page-doodle-right" aria-hidden="true">
          <DoodleArrow />
        </div>
      </header>

      <section className="menu-group">
        <div className="menu-group-head page-intro">
          <span className="menu-group-rule" aria-hidden="true" />
          <h2 className="menu-group-title display-type">BURGERS</h2>
          <span className="menu-group-rule" aria-hidden="true" />
        </div>
        <div className="menu-grid">
          {MENU.map((it, i) => (
            <article key={it.id} className="menu-card">
              {it.tag && <span className="menu-card-tag">{it.tag}</span>}
              <span className="menu-card-num display-type" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="menu-card-imgwrap">
                <img src={it.img} alt={it.name} width={640} height={640} />
              </div>
              <div className="menu-card-body">
                <div className="menu-card-row">
                  <h3 className="menu-card-name display-type">{it.name}</h3>
                  <span className="menu-card-price">{money(it.price)}</span>
                </div>
                <p className="menu-card-blurb">{it.blurb}</p>
                <button type="button" className="menu-card-add" onClick={onAdd(it.id)}>
                  <span className="menu-card-add-badge">
                    <PlusIcon />
                  </span>
                  <span>Add to order</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* sits directly under the cards — the CTA should follow the choice, not
          float far below it */}
      <div className="page-foot is-tight">
        <p className="page-foot-note">Everything is cooked to order, so it lands hot.</p>
        <Link to="/order" className="page-foot-cta">
          <span>{count > 0 ? `Go to my order · ${count}` : 'Go to my order'}</span>
          <span className="page-foot-cta-badge">
            <BagIcon />
          </span>
        </Link>
      </div>

      <RibbonBand />
    </div>
  )
}
