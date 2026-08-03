import { forwardRef } from 'react'

export type CardSpec = {
  title: string
  caption: string
  img: string
  imgAlt: string
  /** measured rotation in degrees (design.md §4.6) */
  rotate: number
  /** vw position of card top-left within recipe stage */
  left: string
  top: string
}

type Props = CardSpec & {
  onEnter?: (el: HTMLDivElement) => void
  onLeave?: (el: HTMLDivElement) => void
}

/**
 * White ingredient card ~460×500px, radius 24, soft shadow, rotated per
 * measured angle. Anton title overlaps the top edge (~50%), yellow rounded
 * image area with transparent PNG, caption below (design.md §7).
 */
const IngredientCard = forwardRef<HTMLDivElement, Props>(function IngredientCard(
  { title, caption, img, imgAlt, left, top, onEnter, onLeave },
  ref,
) {
  return (
    <div
      ref={ref}
      className="ing-card"
      style={{ left, top }}
      onMouseEnter={(e) => onEnter?.(e.currentTarget)}
      onMouseLeave={(e) => onLeave?.(e.currentTarget)}
    >
      <div className="ing-card-title display-type">{title}</div>
      <div className="ing-card-body">
        <div className="ing-card-imgwrap">
          <img src={img} alt={imgAlt} width={640} height={640} loading="lazy" />
        </div>
        <p className="ing-card-caption">{caption}</p>
      </div>
    </div>
  )
})

export default IngredientCard
