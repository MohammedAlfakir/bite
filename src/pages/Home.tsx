import { useEffect, useRef, useState } from 'react'
import RibbonBand from '@/components/RibbonBand'
import DoodleArrow from '@/components/DoodleArrow'
import EcoBadge from '@/components/EcoBadge'
import SmileyDoodle from '@/components/SmileyDoodle'
import IngredientCard from '@/components/IngredientCard'
import type { CardSpec } from '@/components/IngredientCard'
import BurgerCapsule from '@/components/BurgerCapsule'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'

/* ------------------------------------------------------------------ data */

/* Hero burger selector: each thumb swaps the hero burger (middle = default). */
const OPTIONS = [
  { thumb: '/mini-burger-1.png', hero: '/mini-burger-1.png', alt: 'Tall double-patty burger' },
  { thumb: '/mini-burger-2.png', hero: '/burger-hero.png', alt: 'Classic cheeseburger' },
  { thumb: '/mini-burger-3.png', hero: '/mini-burger-3.png', alt: 'Small cheeseburger' },
]
const DEFAULT_OPTION = 1

/** Exploded recipe stack, top → bottom. This EXPLODED layout is the resting
 *  state: a DENSE stack of 8 floating layers that nearly touch or slightly
 *  tuck (gaps ≤30px; the tomato intentionally overlaps the bacon's lower
 *  right), matching the grid-re-measured reference @1920
 *  (page y / visible w×h / visible centre x):
 *  bun 1720–2000 ×645×280 c965, bacon 2000–2290 ×660×290 c920,
 *  tomato 2200–2310 ×390×110 c1095, cheese 2380–2570 ×685×190 c960,
 *  patty 2560–2790 ×600×230 c945, onion 2820–2960 ×490×140 c870,
 *  lettuce 2950–3260 ×590×310 c905, board 3260–3680 ×710×420 c920
 *  (section top = 1355px @1920, panel centre x = 960).
 *  w/top = css box width/top (vw) derived from each PNG's tight alpha content
 *  box (largest connected component, alpha>60) so the VISIBLE food lands on
 *  the reference positions; cx = horizontal fraction of the visible content's
 *  centre inside the PNG, offset per layer so the VISIBLE centre lands on the
 *  reference centre (some layers sit left/right of the panel axis);
 *  sy = vertical squash applied to the img (origin top) so the VISIBLE height
 *  also matches the reference — our stock PNGs are proportionally taller than
 *  the reference's flatter renders. */
const LAYERS = [
  { src: '/layer-top-bun.png', alt: 'Sesame top bun', w: 38.54, top: 17.52, cx: 0.4936, sy: 0.669, iw: 1536, ih: 1024 },
  { src: '/layer-bacon.png', alt: 'Crispy bacon strips with basil', w: 44.22, top: 30.26, cx: 0.5393, sy: 0.725, iw: 1536, ih: 1024 },
  { src: '/layer-tomato.png', alt: 'Fresh tomato slice', w: 29.6, top: 43.01, cx: 0.2462, sy: 0.371, iw: 1536, ih: 1024 },
  { src: '/layer-cheese.png', alt: 'Melting cheddar slice', w: 52.74, top: 52.06, cx: 0.4788, sy: 0.361, iw: 1536, ih: 1024 },
  { src: '/layer-patty.png', alt: 'Flame-grilled beef patty', w: 41.56, top: 60.68, cx: 0.5087, sy: 0.558, iw: 1536, ih: 1024 },
  { src: '/layer-onion-tomato.png', alt: 'Red onion rings with tomato', w: 31.54, top: 74.88, cx: 0.6385, sy: 0.467, iw: 1536, ih: 1024 },
  { src: '/layer-lettuce.png', alt: 'Fresh lettuce leaves', w: 35.62, top: 80.73, cx: 0.5788, sy: 0.871, iw: 1536, ih: 1024 },
  { src: '/layer-bottom-bun-board.png', alt: 'Bottom bun on a wooden board', w: 47.37, top: 89.5, cx: 0.5463, sy: 1.129, iw: 1536, ih: 1024 },
]

/* Cards sit mostly OUTSIDE the yellow panel: inner edge ≈ panel edge,
 * bodies overlapping the panel boundary like the reference (measured @1920). */
const CARDS: CardSpec[] = [
  {
    title: 'BACON', rotate: -8, left: '7.8vw', top: '28.4vw', img: '/card-bacon.png',
    imgAlt: 'Stack of raw bacon rashers',
    caption: 'Powered by bacon and admit it, for a second there, all your problems went away',
  },
  {
    title: 'PATTY', rotate: 7, left: '72.7vw', top: '33.6vw', img: '/card-patty.png',
    imgAlt: 'Grilled beef patty',
    caption: '100% pure beef, big and beefy, go wild for our juicy beefy burgers',
  },
  {
    title: 'CHEESE', rotate: -6, left: '7.8vw', top: '65.9vw', img: '/card-cheese.png',
    imgAlt: 'Cheese wedge with holes',
    caption: 'The cheese for an awesome healthy future, because cheese means more',
  },
  {
    title: 'BUN', rotate: 8, left: '72.9vw', top: '74.7vw', img: '/card-bun.png',
    imgAlt: 'Two sesame brioche buns',
    caption: 'Fresh bun, baked to perfection, where every loaf is a masterpiece',
  },
  {
    title: 'VEGGIES', rotate: -9, left: '11.2vw', top: '113.8vw', img: '/card-veggies.png',
    imgAlt: 'Two ripe tomatoes with stems',
    caption: "Veggies filled with the essence of nature, don't panic, it's organic",
  },
  {
    title: 'SAUCE', rotate: 6, left: '70.6vw', top: '117.4vw', img: '/card-sauce.png',
    imgAlt: 'Spoon with burger sauce swirl',
    caption: 'Fresh bun, baked to perfection, where every loaf is a masterpiece',
  },
]

/* ------------------------------------------------------------------ hero */

function HeroSection() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const burgerImgRef = useRef<HTMLImageElement>(null)
  const [active, setActive] = useState(DEFAULT_OPTION)
  const firstRender = useRef(true)

  /* swap-in animation whenever the selected burger changes */
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    const img = burgerImgRef.current
    if (!img || prefersReducedMotion()) return
    gsap.fromTo(
      img,
      { scale: 0.45, y: -90, rotation: -7, opacity: 0 },
      { scale: 1, y: 0, rotation: 0, opacity: 1, duration: 0.65, ease: 'back.out(1.6)' },
    )
  }, [active])

  const pick = (i: number) => {
    if (i === active) return
    const img = burgerImgRef.current
    if (!img || prefersReducedMotion()) {
      setActive(i)
      return
    }
    gsap.killTweensOf(img)
    gsap.to(img, {
      scale: 0.45,
      y: 80,
      rotation: 7,
      opacity: 0,
      duration: 0.3,
      ease: 'back.in(1.6)',
      onComplete: () => setActive(i),
    })
  }

  useGSAP(
    () => {
      const root = wrapRef.current!
      const reduced = prefersReducedMotion()
      const chars = root.querySelectorAll('.hero-headline .char')
      const burger = root.querySelector('.hero-burger') as HTMLElement
      const burgerImg = root.querySelector('.hero-burger img')
      const floatWrap = root.querySelector('.hero-burger-float')
      const badge = root.querySelector('.hero-badge') as HTMLElement
      const selectors = root.querySelector('.hero-selectors') as HTMLElement
      const risers = root.querySelectorAll('.hero-rise')

      if (reduced) return

      // load timeline — headline char stagger-in, burger scale/rise, rest fade+rise
      const tl = gsap.timeline({ delay: 0.2 })
      tl.from(chars, { y: 60, opacity: 0, stagger: 0.03, duration: 0.9, ease: 'power4.out' }, 0)
      tl.from(burgerImg, { scale: 0.9, y: 40, duration: 1, ease: 'power3.out' }, 0.2)
      tl.from(risers, { y: 30, opacity: 0, stagger: 0.1, duration: 0.7, ease: 'power3.out' }, 0.5)

      // idle floats
      gsap.to(floatWrap, { y: 15, rotation: 2, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.4 })
      gsap.to(badge.firstElementChild, { y: 10, rotation: 4, duration: 8, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      root.querySelectorAll('.doodle').forEach((d, i) => {
        gsap.to(d, { y: i % 2 ? -10 : 10, duration: 4.5 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      })

      // mouse parallax — burger opposite cursor ±20px, badge ±8, selectors ±5
      const bX = gsap.quickTo(burger, 'x', { duration: 0.6, ease: 'power3' })
      const bY = gsap.quickTo(burger, 'y', { duration: 0.6, ease: 'power3' })
      const gX = gsap.quickTo(badge, 'x', { duration: 0.6, ease: 'power3' })
      const gY = gsap.quickTo(badge, 'y', { duration: 0.6, ease: 'power3' })
      const sX = gsap.quickTo(selectors, 'x', { duration: 0.6, ease: 'power3' })
      const sY = gsap.quickTo(selectors, 'y', { duration: 0.6, ease: 'power3' })
      const onMove = (e: MouseEvent) => {
        const dx = e.clientX / window.innerWidth - 0.5
        const dy = e.clientY / window.innerHeight - 0.5
        bX(-dx * 40); bY(-dy * 40)
        gX(dx * 16); gY(dy * 16)
        sX(dx * 10); sY(dy * 10)
      }
      window.addEventListener('mousemove', onMove)
      return () => window.removeEventListener('mousemove', onMove)
    },
    { scope: wrapRef },
  )

  return (
    <div ref={wrapRef} className="relative">
      <section className="hero-stage" aria-label="Love every bite">
        <h1 className="hero-headline display-type" aria-label="LOVE EVERY BITE">
          {'LOVE EVERY BITE'.split('').map((c, i) => (
            <span key={i} className="char inline-block" aria-hidden="true">
              {c === ' ' ? '\u00A0' : c}
            </span>
          ))}
        </h1>
        <div className="hero-selectors hero-rise">
          {OPTIONS.map((o, i) => (
            <button
              key={o.thumb}
              type="button"
              className={`selector-circle${active === i ? ' active' : ''}`}
              aria-label={`Select ${o.alt}`}
              aria-pressed={active === i}
              onClick={() => pick(i)}
            >
              <img src={o.thumb} alt="" width={512} height={512} />
            </button>
          ))}
        </div>
        <div className="hero-badge hero-rise">
          <EcoBadge />
        </div>
        <p className="hero-paragraph hero-rise">
          We serving the greatest burgers on the planet, paving the way for delicious burgers, flame on !
        </p>
        <div className="doodle doodle-hero-left hero-rise">
          <DoodleArrow />
        </div>
        <div className="doodle doodle-hero-right hero-rise">
          <DoodleArrow flipX flipY />
        </div>
      </section>
      <RibbonBand />
      {/* burger renders above ribbons, overlapping the headline's lower edge */}
      <div className="hero-burger">
        <div className="hero-burger-float">
          <img
            ref={burgerImgRef}
            src={OPTIONS[active].hero}
            alt={OPTIONS[active].alt}
            width={1536}
            height={1536}
            fetchPriority="high"
          />
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ recipe */

function RecipeSection() {
  const ref = useRef<HTMLElement>(null)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])

  useGSAP(
    () => {
      const root = ref.current!
      const reduced = prefersReducedMotion()

      // cards always end at their measured rotation
      cardRefs.current.forEach((el, i) => {
        if (el) gsap.set(el, { rotate: CARDS[i].rotate })
      })

      if (reduced) return

      // headline word-level reveal
      gsap.from(root.querySelectorAll('.recipe-headline .word'), {
        y: 50,
        opacity: 0,
        stagger: 0.12,
        duration: 0.9,
        ease: 'power4.out',
        scrollTrigger: { trigger: root.querySelector('.recipe-headline'), start: 'top 80%' },
      })

      // stack scrub — the exploded dense layout is the RESTING state. The scrub
      // only adds a subtle drift (≤±42px): layers start slightly more spread
      // when the section enters and settle gently toward the resting layout by
      // the end of the scroll (a soft assemble tendency).
      const layerEls = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('.recipe-layer'))
      const scrub = gsap.timeline({
        scrollTrigger: { trigger: root, start: 'top 70%', end: 'bottom 60%', scrub: 1 },
      })
      layerEls.forEach((el, i) => {
        const drift = -(3.5 - i) * 0.62 // vw, outward from the stack centre
        scrub.fromTo(el, { y: `${drift}vw` }, { y: 0, duration: 1, ease: 'none' }, 0)
      })

      // per-layer idle float (staggered) on inner wrappers
      root.querySelectorAll('.recipe-layer-float').forEach((el, i) => {
        gsap.to(el, { y: 8, duration: 2.4, delay: i * 0.15, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      })

      // subtle mouse parallax per layer (5–15px depth)
      const quicks = layerEls.map((el) =>
        gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' }),
      )
      const onMove = (e: MouseEvent) => {
        const dx = e.clientX / window.innerWidth - 0.5
        layerEls.forEach((_, i) => quicks[i](dx * (5 + i * 1.5)))
      }
      window.addEventListener('mousemove', onMove)

      // card entrances — opacity/y/rotate, back.out(1.4), trigger 80%
      cardRefs.current.forEach((el, i) => {
        if (!el) return
        gsap.fromTo(
          el,
          { opacity: 0, y: 80, rotate: 0 },
          {
            opacity: 1,
            y: 0,
            rotate: CARDS[i].rotate,
            duration: 0.9,
            ease: 'back.out(1.4)',
            delay: (i % 2) * 0.12,
            scrollTrigger: { trigger: el, start: 'top 80%' },
          },
        )
      })

      // smiley + flanking doodles slow float
      gsap.to(root.querySelector('.recipe-smiley'), { y: 10, duration: 4, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      root.querySelectorAll('.doodle-recipe-left, .doodle-recipe-right').forEach((d, i) => {
        gsap.to(d, { y: i ? -10 : 10, duration: 4.5 + i * 0.5, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      })

      return () => window.removeEventListener('mousemove', onMove)
    },
    { scope: ref },
  )

  const onCardEnter = () => (el: HTMLDivElement) => {
    if (prefersReducedMotion()) return
    gsap.to(el, { rotate: 0, scale: 1.04, duration: 0.35, ease: 'power3.out' })
  }
  const onCardLeave = (i: number) => (el: HTMLDivElement) => {
    if (prefersReducedMotion()) return
    gsap.to(el, { rotate: CARDS[i].rotate, scale: 1, duration: 0.35, ease: 'power3.out' })
  }

  return (
    <section ref={ref} className="recipe-stage" aria-label="Our secret recipe">
      <h2 className="recipe-headline display-type">
        <span className="word inline-block">OUR</span>{' '}
        <span className="word inline-block">SECRET</span>
        <br />
        <span className="word inline-block">RECIPE</span>
      </h2>
      <div className="recipe-stack">
        {LAYERS.map((l) => (
          <div
            key={l.src}
            className="recipe-layer"
            style={{
              top: `calc(${l.top}vw * var(--lts, 1) + var(--lt0, 0vw))`,
              width: `calc(${l.w}vw * var(--ls, 1))`,
              marginLeft: `calc(${l.w}vw * var(--ls, 1) * ${-l.cx})`,
            }}
          >
            <div className="recipe-layer-float">
              <img
                src={l.src}
                alt={l.alt}
                width={l.iw}
                height={l.ih}
                loading="lazy"
                style={{ transform: `scaleY(${l.sy})`, transformOrigin: '0 0' }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="recipe-smiley">
        <SmileyDoodle />
      </div>
      <div className="doodle doodle-recipe-left">
        <DoodleArrow flipX />
      </div>
      <div className="doodle doodle-recipe-right">
        <DoodleArrow />
      </div>
      <div className="recipe-cards">
        {CARDS.map((c, i) => (
          <IngredientCard
            key={c.title}
            {...c}
            ref={(el) => {
              cardRefs.current[i] = el
            }}
            onEnter={onCardEnter()}
            onLeave={onCardLeave(i)}
          />
        ))}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ food rules */

const FR_LINES: { words: string[]; capsule?: { img: string; alt: string; w: number } }[] = [
  { words: ['FOOD', 'RULES', ':', 'LITTLE'] },
  { words: ['RIVALS', 'THE'], capsule: { img: '/mini-burger-1.png', alt: 'Tall double burger', w: 34.7 } },
  { words: ['PLEASURE', 'OF'], capsule: { img: '/mini-burger-2.png', alt: 'Classic cheeseburger', w: 28.3 } },
  { words: ['TEARING', 'INTO A'], capsule: { img: '/mini-burger-3.png', alt: 'Small cheeseburger', w: 14.6 } },
  { words: ['GLISTENING', 'BURGER'] },
]

function FoodRulesSection() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const root = ref.current!
      if (prefersReducedMotion()) return

      // line-by-line reveal — y +40, opacity, ±1.5° rotation, trigger 85%
      root.querySelectorAll('.fr-line').forEach((line, i) => {
        gsap.from(line, {
          y: 40,
          opacity: 0,
          rotate: i % 2 ? 1.5 : -1.5,
          duration: 0.8,
          ease: 'power4.out',
          scrollTrigger: { trigger: line, start: 'top 85%' },
        })
      })
      // capsule images pop with back.out(2), 0.15s after their line
      root.querySelectorAll('.fr-capsule img').forEach((img, i) => {
        gsap.from(img, {
          scale: 0.6,
          duration: 0.6,
          delay: 0.15,
          ease: 'back.out(2)',
          scrollTrigger: { trigger: img.closest('.fr-line'), start: 'top 85%' },
        })
        // idle micro-float
        gsap.to(img, { y: 6, duration: 3, delay: i * 0.3, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      })
    },
    { scope: ref },
  )

  return (
    <section ref={ref} className="food-rules display-type" aria-label="Food rules: little rivals the pleasure of tearing into a glistening burger">
      {FR_LINES.map((line, li) => (
        <div key={li} className="fr-line">
          {line.capsule ? (
            <>
              <span className="fr-word">{line.words[0]}</span>
              <BurgerCapsule img={line.capsule.img} imgAlt={line.capsule.alt} widthVw={line.capsule.w} />
              <span className="fr-word">{line.words[1]}</span>
            </>
          ) : (
            line.words.map((w) => (
              <span key={w} className="fr-word">
                {w}
              </span>
            ))
          )}
        </div>
      ))}
    </section>
  )
}

/* ------------------------------------------------------------------ page */

export default function Home() {
  return (
    <>
      {/* one continuous yellow pill behind hero → ribbons → recipe */}
      <div className="pillar-zone">
        <div className="yellow-pillar" aria-hidden="true" />
        <HeroSection />
        <RecipeSection />
      </div>
      <FoodRulesSection />
      <RibbonBand />
    </>
  )
}
