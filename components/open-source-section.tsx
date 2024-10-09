import { Github } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function OpenSourceSection() {
  const repoUrl = 'https://github.com/NicolasMontone/chat-with-your-base'

  return (
    <section className="py-12 px-4 md:px-6 lg:px-8 bg-secondary">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-6">Open Source Project</h2>
        <p className="text-lg mb-4">
          "Chat with Your Database" is an open-source project. We believe in the
          power of community-driven development and transparency.
        </p>
        <p className="mb-6">
          All of our code is publicly available, allowing you to explore,
          contribute, or even customize the application to fit your specific
          needs.
        </p>
        <div className="flex justify-center items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Github className="h-5 w-5" />
          <span>Licensed under MIT</span>
        </div>
        <Button asChild>
          <a
            href={repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center"
          >
            <Github className="mr-2 h-4 w-4" />
            View on GitHub
          </a>
        </Button>
      </div>
    </section>
  )
}
