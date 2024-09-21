import { ThemeSwitcher } from '@/components/theme-switcher'
import { GeistSans } from 'geist/font/sans'
import { ThemeProvider } from 'next-themes'

import './globals.css'
import { createClient } from '../utils/supabase/server'
import { TailwindIndicator } from '@/components/tailwind-indicator'
import { CliIndicator } from '@/components/cli-indicator'
import { Toaster } from '@/components/ui/toaster'
import Navbar from '../components/navbar'

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Next.js and Supabase Starter Kit',
  description: 'The fastest way to build apps with Next.js and Supabase',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isCli = process.env.IS_CLI === 'true'

  let user = null

  if (!isCli) {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    user = data.user
  }

  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center max-w-full mx-auto">
            <div className="h-screen w-full dark:bg-black bg-white  dark:bg-dot-white/[0.2] bg-dot-black/[0.2] relative flex items-center justify-center">
              <div className="absolute pointer-events-none inset-0 flex items-center justify-center dark:bg-black bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>

              <Navbar user={user} isCli={isCli} />
              <div className="flex flex-col gap-20 max-w-5xl p-5">
                {children}
              </div>
              <ThemeSwitcher />
            </div>
          </main>
          <CliIndicator />
          <TailwindIndicator />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
