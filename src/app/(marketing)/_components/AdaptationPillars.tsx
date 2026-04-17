'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { adaptationPillars } from '../_content'
import { ProductScreen } from './ProductScreens'

export function AdaptationPillars() {
  const [activeIndex, setActiveIndex] = useState(0)
  const reduceMotion = useReducedMotion()
  const sectionRef = useRef<HTMLDivElement | null>(null)
  const stickyRef = useRef<HTMLDivElement | null>(null)
  const itemRefs = useRef<Array<HTMLElement | null>>([])

  useEffect(() => {
    if (reduceMotion) return
    let active = true
    let cleanup = () => {}

    async function loadGsap() {
      const gsapModule = await import('gsap')
      const scrollTriggerModule = await import('gsap/ScrollTrigger')
      if (!active) return

      const gsap = gsapModule.gsap
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger
      gsap.registerPlugin(ScrollTrigger)

      const triggers: Array<{ kill: () => void }> = []

      if (sectionRef.current && stickyRef.current) {
        triggers.push(
          ScrollTrigger.create({
            trigger: sectionRef.current,
            start: 'top top+=96',
            end: 'bottom bottom-=80',
            pin: stickyRef.current,
            pinSpacing: false,
          })
        )
      }

      itemRefs.current.forEach((item, index) => {
        if (!item) return
        triggers.push(
          ScrollTrigger.create({
            trigger: item,
            start: 'top center',
            end: 'bottom center',
            onEnter: () => setActiveIndex(index),
            onEnterBack: () => setActiveIndex(index),
          })
        )
      })

      cleanup = () => {
        triggers.forEach((trigger) => trigger.kill())
      }
    }

    void loadGsap()

    return () => {
      active = false
      cleanup()
    }
  }, [reduceMotion])

  const activePillar = useMemo(
    () => adaptationPillars[activeIndex] ?? adaptationPillars[0],
    [activeIndex]
  )

  return (
    <div
      ref={sectionRef}
      className="grid gap-12 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1fr)] lg:gap-20"
    >
      <div ref={stickyRef} className="lg:pt-8">
        <ProductScreen screen={activePillar.screen} />
      </div>
      <div className="space-y-20 lg:space-y-32">
        {adaptationPillars.map((pillar, index) => (
          <motion.article
            key={pillar.number}
            ref={(node) => {
              itemRefs.current[index] = node
            }}
            initial={reduceMotion ? false : { opacity: 0.35, y: 24 }}
            whileInView={reduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`rounded-[32px] border p-8 transition-colors duration-300 lg:min-h-[62vh] ${
              activeIndex === index
                ? 'border-[#2A2A2F] bg-[#111113]'
                : 'border-[#1F1F23] bg-[#0F1012]'
            }`}
          >
            <p className="font-mono text-[48px] tracking-[-0.04em] text-[#2F3035]">
              {pillar.number}
            </p>
            <h3 className="mt-8 text-[32px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#F5F5F4]">
              {pillar.title}
            </h3>
            <p className="mt-5 max-w-xl text-lg leading-8 text-[#A1A19E]">{pillar.body}</p>
            <Link
              href={pillar.citationHref}
              title={pillar.citation}
              className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-[#CAFF4C]"
            >
              Related research
              <span className="font-mono text-[12px] text-[#6B6B68]">{pillar.citation}</span>
            </Link>
          </motion.article>
        ))}
      </div>
    </div>
  )
}
