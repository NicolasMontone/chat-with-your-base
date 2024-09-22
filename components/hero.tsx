import React from 'react'
import { Spotlight } from '@/components/ui/spotlight'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function Hero() {
  return (
    <div className="h-[30rem] w-full rounded-md md:items-center antialiased relative">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-40"
        fill="white"
      />
      <div className=" p-4 max-w-7xl  mx-auto relative z-10  w-full pt-20 md:pt-0">
        <h1 className="text-7xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 bg-opacity-50">
          Chat with your <br /> database
        </h1>
        <p className="mt-4 font-normal text-base text-neutral-300 max-w-lg text-center mx-auto">
          Unlock the power of your data: Connect any Postgres database and let
          our AI dive deep. Chat to query, analyze, and even run operations -
          all from one intuitive interface. Experience the future of database
          interaction today!
        </p>
      </div>
      <Link href="/login">
        <Button className="mt-4 w-full">Get Started</Button>
      </Link>
    </div>
  )
}
