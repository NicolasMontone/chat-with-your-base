'use client'
import React from 'react'

import { motion } from 'framer-motion'

export default function TextSkeleton({ maxRows = 3 }: { maxRows?: number }) {
  const fakeArray = Array.from({ length: maxRows }, (_, i) => i)
  return (
    <div className="space-y-2">
      {fakeArray.map((_, index) => {
        const isLast = index === fakeArray.length - 1
        return (
          <motion.div
            key={index}
            className="w-full h-4 bg-primary opacity-20 rounded-md animate-pulse"
            transition={{ duration: 0.5, delay: index * 0.4 }}
            initial={{ width: 0 }}
            animate={{
              width: isLast ? '70%' : '100%',
            }}
          />
        )
      })}
    </div>
  )
}
