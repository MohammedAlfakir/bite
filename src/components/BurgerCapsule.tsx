import { forwardRef } from 'react'

type Props = {
  img: string
  imgAlt: string
  /** capsule width in vw (measured per line) */
  widthVw: number
}

/**
 * Yellow pill capsule (~280×150px, radius 999) with a mini-burger PNG that
 * overflows the capsule vertically (design.md §7). Used 3× in Food Rules.
 */
const BurgerCapsule = forwardRef<HTMLDivElement, Props>(function BurgerCapsule(
  { img, imgAlt, widthVw },
  ref,
) {
  return (
    <span ref={ref} className="fr-capsule" style={{ width: `${widthVw}vw` }}>
      <img src={img} alt={imgAlt} width={512} height={512} loading="lazy" />
    </span>
  )
})

export default BurgerCapsule
