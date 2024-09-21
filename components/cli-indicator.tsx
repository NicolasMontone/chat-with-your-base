import React from 'react'

export function CliIndicator() {
  if (process.env.NODE_ENV === 'production') return null
  if (process.env.IS_CLI !== 'true') return null

  return (
    <div className="fixed top-2 left-1 z-50 flexitems-center justify-center rounded-full bg-gray-800 p-3 font-mono text-xs text-white">
      Running in CLI mode
    </div>
  )
}
