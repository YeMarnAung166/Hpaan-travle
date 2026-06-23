import { useInView } from 'framer-motion'
import { useRef } from 'react'

export function useScrollReveal(options = {}) {
  const ref = useRef(null)
  const isInView = useInView(ref, {
    once: true,
    margin: '-80px 0px',
    ...options,
  })
  return [ref, isInView]
}
