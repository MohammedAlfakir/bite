import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router'
import Lenis from 'lenis'
import BackgroundLines from './BackgroundLines'
import Navbar from './Navbar'
import Footer from './Footer'
import { CartProvider } from '@/lib/cart'
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/gsap'

/**
 * Shared chrome: fixed background line pattern, top nav (normal flow at page
 * top, absolute — not sticky), page content, footer CTA + mirrored bottom nav.
 * Children pattern: Layout wraps <Routes> (react-dev.md pattern A).
 */
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      <LayoutInner>{children}</LayoutInner>
    </CartProvider>
  )
}

function LayoutInner({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const { pathname } = useLocation()

  // Lenis smooth scroll (lerp 0.1) synced to GSAP ticker + ScrollTrigger
  useEffect(() => {
    if (prefersReducedMotion()) return
    const lenis = new Lenis({ lerp: 0.1 })
    lenisRef.current = lenis
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  // Land at the top of each new route and re-measure. Lenis keeps its own scroll
  // position, so both it and the window need resetting; ScrollTrigger must then
  // re-measure or the new page's entrance triggers use stale positions.
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true })
    window.scrollTo(0, 0)
    ScrollTrigger.refresh()
  }, [pathname])

  // The footer is the home page's ORDER NOW finale — the sub-pages have their
  // own CTAs, so it would just repeat itself there.
  const showFooter = pathname === '/'

  return (
    <div ref={rootRef} className="relative min-h-[100dvh]">
      <BackgroundLines />
      <div className="relative z-[1]">
        <Navbar id="top" />
        <main>{children}</main>
        {showFooter && <Footer />}
      </div>
    </div>
  )
}
