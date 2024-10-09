import { Hero } from '@/components/hero'
import HowItWorks from '@/components/how-it-works'
import OpenSourceSection from '@/components/open-source-section'

const Section = ({ children }: { children: React.ReactNode }) => (
  <section className="max-w-[1240px] mx-auto">{children}</section>
)

export default async function Index() {
  return (
    <>
      <main className="mt-12 mx-auto">
        <Section>
          <Hero />
        </Section>
        <Section>
          <HowItWorks />
        </Section>
        <OpenSourceSection />
      </main>
    </>
  )
}
