import { useEffect, useRef } from 'react'
import { money, useCart } from '@/lib/cart'
import { gsap, useGSAP, prefersReducedMotion } from '@/lib/gsap'
import { BagIcon, CheckIcon, MinusIcon, PlusIcon, TrashIcon } from '@/components/icons'
import DoodleArrow from '@/components/DoodleArrow'
import RibbonBand from '@/components/RibbonBand'
import { Link } from 'react-router'

const FEE = 2.5
const TAX_RATE = 0.08

/**
 * /order — the card you are about to order, plus every order already placed.
 * A real page, so it scrolls with the document like Home and /menu.
 *
 * Animation: arch + headline like /menu, rows slide in from the left, the yellow
 * total panel sticks while you scroll, placing an order flies the rows out and
 * pops the new receipt into the list below.
 */
export default function Order() {
  const ref = useRef<HTMLDivElement>(null)
  const { lines, count, subtotal, add, dec, remove, clear, orders, placeOrder, justPlaced } = useCart()

  const tax = subtotal * TAX_RATE
  const fee = lines.length ? FEE : 0
  const total = subtotal + tax + fee

  useGSAP(
    () => {
      const root = ref.current!
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
          rotate: -6,
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
        .from(root.querySelectorAll('.cart-row'), {
          x: -70,
          opacity: 0,
          rotate: -1.5,
          duration: 0.65,
          stagger: 0.07,
          ease: 'back.out(1.4)',
        }, 0.3)
        .from(root.querySelector('.cart-total'), {
          y: 70,
          opacity: 0,
          duration: 0.75,
          ease: 'expo.out',
        }, 0.4)

      root.querySelectorAll('.page-doodle').forEach((d, i) => {
        gsap.to(d, { y: i % 2 ? -10 : 10, duration: 4.2 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1 })
      })
    },
    { scope: ref },
  )

  /* -------------------------------- animate newly appended rows in */
  const prevLen = useRef(lines.length)
  useEffect(() => {
    if (prefersReducedMotion()) {
      prevLen.current = lines.length
      return
    }
    if (lines.length > prevLen.current) {
      const rows = ref.current?.querySelectorAll('.cart-row')
      const last = rows?.[rows.length - 1]
      if (last) gsap.fromTo(last, { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: 'back.out(1.5)' })
    }
    prevLen.current = lines.length
  }, [lines.length])

  /* -------------------------- confirmation + new receipt animation */
  useEffect(() => {
    if (!justPlaced || prefersReducedMotion()) return
    const root = ref.current
    if (!root) return
    const toast = root.querySelector('.order-toast')
    const newest = root.querySelector('.order-card')
    if (toast) {
      // slide in from off the right edge, hold, then slip back out
      gsap
        .timeline()
        .fromTo(
          toast,
          { x: 60, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.55, ease: 'back.out(1.8)' },
        )
        .to(toast, { x: 60, opacity: 0, duration: 0.4, ease: 'power2.in' }, '+=1.5')
    }
    if (newest) {
      gsap.fromTo(newest, { y: 50, opacity: 0, scale: 0.92 }, { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: 'back.out(1.6)', delay: 0.1 })
      gsap.fromTo(
        newest.querySelector('.order-card-ref'),
        { scale: 0.5, rotate: -12 },
        { scale: 1, rotate: 0, duration: 0.6, ease: 'back.out(3)', delay: 0.35 },
      )
    }
  }, [justPlaced])

  const bump = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (prefersReducedMotion()) return
    const chip = e.currentTarget.parentElement?.querySelector('.cart-qty-num')
    if (chip) gsap.fromTo(chip, { scale: 1.45 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' })
  }

  const onRemove = (id: string) => (e: React.MouseEvent<HTMLButtonElement>) => {
    const row = e.currentTarget.closest('.cart-row')
    if (!row || prefersReducedMotion()) {
      remove(id)
      return
    }
    gsap.to(row, {
      x: 60,
      opacity: 0,
      height: 0,
      marginBottom: 0,
      duration: 0.34,
      ease: 'power3.in',
      onComplete: () => remove(id),
    })
  }

  const onPlace = () => {
    if (!lines.length) return
    if (prefersReducedMotion()) {
      placeOrder(total)
      return
    }
    const rows = ref.current!.querySelectorAll('.cart-row')
    gsap.to(rows, {
      x: 90,
      opacity: 0,
      duration: 0.34,
      stagger: 0.05,
      ease: 'power3.in',
      onComplete: () => placeOrder(total),
    })
  }

  const HEADLINE = 'MY ORDER'

  return (
    <div ref={ref} className="page-stage">
      <div className="page-arch" aria-hidden="true" />

      <header className="page-head">
        <h1 className="page-title display-type" aria-label={HEADLINE}>
          {HEADLINE.split('').map((c, i) => (
            <span key={i} className="char inline-block" aria-hidden="true">
              {c === ' ' ? '\u00A0' : c}
            </span>
          ))}
        </h1>
        {/* only worth a line when there is actually something to say */}
        {count > 0 && (
          <p className="page-sub page-intro">
            {`${count} ${count === 1 ? 'burger' : 'burgers'} ready — place the order and we fire up the grill.`}
          </p>
        )}
        <div className="page-doodle page-doodle-left" aria-hidden="true">
          <DoodleArrow flipX />
        </div>
        <div className="page-doodle page-doodle-right" aria-hidden="true">
          <DoodleArrow />
        </div>
      </header>

      {/* fixed toast in the top-right corner — it must not push the layout */}
      {justPlaced && (
        <div className="order-toast" role="status" aria-live="polite">
          <span className="order-toast-badge">
            <CheckIcon />
          </span>
          <span className="order-toast-text">
            <strong>Order {justPlaced} is in</strong>
            <span>The grill is on it.</span>
          </span>
        </div>
      )}

      {/* two columns either way: the card on the left, the total on the right —
          an empty card still shows a $0.00 total so the layout stays put */}
      <div className="cart-body">
        {lines.length === 0 ? (
          <div className="cart-empty page-intro">
            <img src="/mini-burger-2.png" alt="" width={512} height={512} />
            <p className="display-type">{orders.length ? 'CARD IS EMPTY' : 'NO ORDER YET'}</p>
            <Link to="/menu" className="cart-empty-cta">
              <span className="cart-empty-cta-badge">
                <PlusIcon />
              </span>
              <span>{orders.length ? 'Order again' : 'Browse the menu'}</span>
            </Link>
          </div>
        ) : (
          <ul className="cart-list">
            {lines.map((l) => (
              <li key={l.item.id} className="cart-row">
                <div className="cart-row-imgwrap">
                  <img src={l.item.img} alt={l.item.name} width={640} height={640} />
                </div>
                <div className="cart-row-main">
                  <h3 className="cart-row-name display-type">{l.item.name}</h3>
                  <p className="cart-row-blurb">{l.item.blurb}</p>
                  <div className="cart-qty">
                    <button
                      type="button"
                      className="cart-qty-btn"
                      onClick={(e) => {
                        dec(l.item.id)
                        bump(e)
                      }}
                      aria-label={`Remove one ${l.item.name}`}
                    >
                      <MinusIcon />
                    </button>
                    <span className="cart-qty-num">{l.qty}</span>
                    <button
                      type="button"
                      className="cart-qty-btn"
                      onClick={(e) => {
                        add(l.item.id)
                        bump(e)
                      }}
                      aria-label={`Add one ${l.item.name}`}
                    >
                      <PlusIcon />
                    </button>
                  </div>
                </div>
                <div className="cart-row-end">
                  <span className="cart-row-price">{money(l.item.price * l.qty)}</span>
                  <button
                    type="button"
                    className="cart-row-del"
                    onClick={onRemove(l.item.id)}
                    aria-label={`Remove ${l.item.name} from your order`}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <aside className="cart-total">
          <h2 className="cart-total-title display-type">TOTAL</h2>
          <dl className="cart-total-rows">
            <div>
              <dt>Subtotal</dt>
              <dd>{money(subtotal)}</dd>
            </div>
            <div>
              <dt>Tax (8%)</dt>
              <dd>{money(tax)}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>{fee ? money(fee) : '—'}</dd>
            </div>
          </dl>
          <div className="cart-total-grand">
            <span>To pay</span>
            <span className="cart-total-grand-num">{money(total)}</span>
          </div>
          <button type="button" className="cart-checkout" disabled={!lines.length} onClick={onPlace}>
            <span>Place order</span>
            <span className="cart-checkout-badge">
              <BagIcon />
            </span>
          </button>
          {lines.length > 0 && (
            <button type="button" className="cart-clear" onClick={clear}>
              Clear the card
            </button>
          )}
          <p className="cart-total-note">Free delivery over $40. Cooked to order, always.</p>
        </aside>
      </div>

      {orders.length > 0 && (
        <section className="orders-section">
          <div className="menu-group-head">
            <span className="menu-group-rule" aria-hidden="true" />
            <h2 className="menu-group-title display-type">PLACED ORDERS</h2>
            <span className="menu-group-rule" aria-hidden="true" />
          </div>
          <ul className="orders-list">
            {orders.map((o) => (
              <li key={o.id} className="order-card">
                <header className="order-card-head">
                  <span className="order-card-ref display-type">{o.ref}</span>
                  <span className="order-card-status">
                    <span className="order-card-dot" aria-hidden="true" />
                    On the grill · {o.etaMins} min
                  </span>
                </header>
                <ul className="order-card-lines">
                  {o.lines.map((l) => (
                    <li key={l.item.id}>
                      <span className="order-card-thumb">
                        <img src={l.item.img} alt="" width={320} height={320} loading="lazy" />
                      </span>
                      <span className="order-card-qty">{l.qty}×</span>
                      <span className="order-card-name">{l.item.name}</span>
                      <span className="order-card-line-price">{money(l.item.price * l.qty)}</span>
                    </li>
                  ))}
                </ul>
                <footer className="order-card-foot">
                  <span>Paid</span>
                  <span className="order-card-total display-type">{money(o.total)}</span>
                </footer>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="page-foot">
        <p className="page-foot-note">Want to add something else?</p>
        <Link to="/menu" className="page-foot-cta">
          <span>Back to the menu</span>
          <span className="page-foot-cta-badge">
            <PlusIcon />
          </span>
        </Link>
      </div>

      <RibbonBand />
    </div>
  )
}
