import { createContext, useCallback, useContext, useMemo, useReducer, useState } from 'react'
import type { ReactNode } from 'react'

/* ------------------------------------------------------------------ menu data */

export type MenuItem = {
  id: string
  name: string
  price: number
  img: string
  blurb: string
  tag?: string
}

/** The menu is exactly the three burgers the hero selector swaps between, so the
 *  overlay shows the same three products the landing page advertises. */
export const MENU: MenuItem[] = [
  {
    id: 'double-stack',
    name: 'Double Stack',
    price: 14.5,
    img: '/mini-burger-1.png',
    blurb: 'Two flame-grilled patties, crispy bacon, aged cheddar and our secret sauce, stacked tall.',
    tag: 'BEST SELLER',
  },
  {
    id: 'classic-cheese',
    name: 'Classic Cheese',
    price: 11.0,
    img: '/burger-hero.png',
    blurb: 'The original. Sesame brioche bun, one juicy patty, melted cheddar, onion and pickles.',
  },
  {
    id: 'lil-bite',
    name: 'Lil Bite',
    price: 8.5,
    img: '/mini-burger-3.png',
    blurb: 'Smaller, still mighty. One patty, one slice of cheese, all of the love.',
  },
]

const ITEM_BY_ID = new Map(MENU.map((i) => [i.id, i]))

/* ------------------------------------------------------------------ cart state */

export type CartLine = { item: MenuItem; qty: number }

type Action =
  | { type: 'add'; id: string; qty?: number }
  | { type: 'dec'; id: string }
  | { type: 'remove'; id: string }
  | { type: 'clear' }

function reducer(state: CartLine[], action: Action): CartLine[] {
  switch (action.type) {
    case 'add': {
      const item = ITEM_BY_ID.get(action.id)
      if (!item) return state
      const qty = action.qty ?? 1
      const found = state.find((l) => l.item.id === action.id)
      if (found) {
        return state.map((l) => (l.item.id === action.id ? { ...l, qty: l.qty + qty } : l))
      }
      return [...state, { item, qty }]
    }
    case 'dec':
      return state
        .map((l) => (l.item.id === action.id ? { ...l, qty: l.qty - 1 } : l))
        .filter((l) => l.qty > 0)
    case 'remove':
      return state.filter((l) => l.item.id !== action.id)
    case 'clear':
      return []
  }
}

/** An order that has been placed — what the "my orders" list shows. */
export type PlacedOrder = {
  id: string
  ref: string
  lines: CartLine[]
  total: number
  placedAt: number
  etaMins: number
}

type CartCtx = {
  lines: CartLine[]
  count: number
  subtotal: number
  add: (id: string, qty?: number) => void
  dec: (id: string) => void
  remove: (id: string) => void
  clear: () => void
  /** id of the item most recently added — drives the "flying" pop feedback */
  lastAdded: string | null
  /** orders already placed, newest first */
  orders: PlacedOrder[]
  /** moves the current lines into `orders` and empties the card */
  placeOrder: (total: number) => void
  /** ref of the order placed most recently — drives the confirmation flash */
  justPlaced: string | null
}

const Ctx = createContext<CartCtx | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(reducer, [])
  const [lastAdded, setLastAdded] = useState<string | null>(null)
  const [orders, setOrders] = useState<PlacedOrder[]>([])
  const [justPlaced, setJustPlaced] = useState<string | null>(null)

  const add = useCallback((id: string, qty?: number) => {
    dispatch({ type: 'add', id, qty })
    setLastAdded(id)
    // reset so the same item can re-trigger the pop
    window.setTimeout(() => setLastAdded((cur) => (cur === id ? null : cur)), 700)
  }, [])

  const value = useMemo<CartCtx>(() => {
    const count = lines.reduce((n, l) => n + l.qty, 0)
    const subtotal = lines.reduce((n, l) => n + l.qty * l.item.price, 0)
    return {
      lines,
      count,
      subtotal,
      add,
      dec: (id) => dispatch({ type: 'dec', id }),
      remove: (id) => dispatch({ type: 'remove', id }),
      clear: () => dispatch({ type: 'clear' }),
      lastAdded,
      orders,
      placeOrder: (total) => {
        if (!lines.length) return
        const seq = orders.length + 1
        const ref = `BITE-${String(1204 + seq * 37).padStart(4, '0')}`
        const placed: PlacedOrder = {
          id: ref,
          ref,
          lines,
          total,
          placedAt: Date.now(),
          // 18 min base + 3 per extra item, so bigger orders read as slower
          etaMins: 18 + Math.max(0, count - 1) * 3,
        }
        setOrders((cur) => [placed, ...cur])
        dispatch({ type: 'clear' })
        setJustPlaced(ref)
        window.setTimeout(() => setJustPlaced((cur) => (cur === ref ? null : cur)), 2600)
      },
      justPlaced,
    }
  }, [lines, lastAdded, orders, justPlaced, add])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useCart() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>')
  return ctx
}

export const money = (n: number) => `$${n.toFixed(2)}`
