'use client'

import Prism from 'prismjs'
import 'prismjs/components/prism-sql'
import 'prismjs/themes/prism-okaidia.css'
import { useEffect } from 'react'

export default function PrismLoader() {
  useEffect(() => {
    Prism.highlightAll()
  }, [])

  return <div className="hidden" />
}
