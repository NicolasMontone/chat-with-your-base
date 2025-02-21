import { ViewTransitions } from 'next-view-transitions'

import { ThemeSwitcher } from '@/components/theme-switcher'
import { GeistSans } from 'geist/font/sans'
import { ThemeProvider } from 'next-themes'

import './globals.css'
import { TailwindIndicator } from '@/components/tailwind-indicator'
import { Toaster } from '@/components/ui/toaster'
import Script from 'next/script'

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: 'Chat With Your Database',
  description: 'The AI that really knows your postgres DB',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ViewTransitions>
      <html lang="en" className={GeistSans.className} suppressHydrationWarning>
        <Script id="crisp-widget" strategy="afterInteractive">
          {`
          window.$crisp=[];window.CRISP_WEBSITE_ID="41a9dc67-1760-4d2c-b1ec-4e8be0ece866";(function(){d=document;s=d.createElement("script");
          s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();`}
        </Script>
        <body className="bg-background text-foreground">
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <ThemeSwitcher />

            <TailwindIndicator />
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ViewTransitions>
  )
}
