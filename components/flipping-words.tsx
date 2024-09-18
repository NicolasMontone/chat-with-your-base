'use client'
import React, { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/utils/cn'

export const FlipWords = ({
  words,
  duration = 3000,
  className,
}: {
  words: string[]
  duration?: number
  className?: string
}) => {
  const [currentPhrase, setCurrentPhrase] = useState(words[0])
  const [isAnimating, setIsAnimating] = useState<boolean>(false)

  const startAnimation = useCallback(() => {
    const word = words[words.indexOf(currentPhrase) + 1] || words[0]
    setCurrentPhrase(word)
    setIsAnimating(true)
  }, [currentPhrase, words])

  useEffect(() => {
    if (!isAnimating)
      setTimeout(() => {
        startAnimation()
      }, duration)
  }, [isAnimating, duration, startAnimation])

  return (
    <AnimatePresence
      onExitComplete={() => {
        setIsAnimating(false)
      }}
    >
      <motion.div
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.4,
          ease: 'easeInOut',
          type: 'spring',
          stiffness: 40,
          damping: 10,
        }}
        exit={{
          opacity: 0,
          y: -30,
          x: 40,
          filter: 'blur(8px)',
          scale: 2,
          position: 'absolute',
        }}
        className={cn(
          'z-10 flex gap-1 relative text-left text-neutral-900 dark:text-neutral-100 px-2',
          className
        )}
        key={currentPhrase}
      >
        {currentPhrase.split(' ').map((word, index) => {
          return (
            <motion.span
              key={currentPhrase + index}
              initial={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{
                delay: index * 0.08,
                duration: 0.4,
              }}
            >
              {word}
            </motion.span>
          )
        })}
      </motion.div>
    </AnimatePresence>
  )
}
