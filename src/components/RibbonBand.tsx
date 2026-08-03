import { memo, useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '@/lib/gsap'

const CHIPS = ['/mini-burger-1.png', '/mini-burger-2.png', '/mini-burger-3.png']

function RibbonUnit({ index }: { index: number }) {
  return (
    <span className="ribbon-unit" aria-hidden="true">
      <span className="ribbon-text">Bite Now</span>
      <span className="ribbon-chip">
        <img src={CHIPS[index % 3]} alt="" width={34} height={34} loading="lazy" />
      </span>
    </span>
  )
}

const Ribbon = memo(function Ribbon({
  className,
  reverse = false,
  chipOffset = 0,
}: {
  className: string
  reverse?: boolean
  chipOffset?: number
}) {
  const trackRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      const track = trackRef.current!
      // seamless xPercent loop over 2 identical halves, ~20s per cycle
      if (reverse) {
        gsap.fromTo(track, { xPercent: -50 }, { xPercent: 0, duration: 20, ease: 'none', repeat: -1 })
      } else {
        gsap.fromTo(track, { xPercent: 0 }, { xPercent: -50, duration: 20, ease: 'none', repeat: -1 })
      }
    },
    { scope: trackRef },
  )

  const half = Array.from({ length: 8 }, (_, i) => i)
  return (
    <div className={`ribbon ${className}`}>
      <div ref={trackRef} className="ribbon-track">
        {[0, 1].map((copy) => (
          <span key={copy} style={{ display: 'flex', flex: 'none' }} aria-hidden="true">
            {half.map((i) => (
              <RibbonUnit key={i} index={i + chipOffset} />
            ))}
          </span>
        ))}
      </div>
    </div>
  )
})

/**
 * Full-bleed band of 2 ink ribbons crossing at the band centre
 * (+4.5° descending behind / -3.5° ascending in front), white Bowlby One SC
 * "BITE NOW" + yellow burger-chip separators, infinite alternating marquee.
 * They cross OVER the continuous yellow pillar. Used identically 2×.
 */
export default function RibbonBand() {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      // subtle 100px y-parallax scrub as the band enters
      gsap.fromTo(
        ref.current,
        { y: 100 },
        {
          y: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top bottom',
            end: 'top 40%',
            scrub: true,
          },
        },
      )
      return () => {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === ref.current) st.kill()
        })
      }
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className="ribbon-band">
      <span className="visually-hidden">Bite now</span>
      <Ribbon className="ribbon-1" chipOffset={0} />
      <Ribbon className="ribbon-2" reverse chipOffset={1} />
    </div>
  )
}
