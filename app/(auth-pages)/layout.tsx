export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen overflow-hidden flex flex-col items-center max-w-full mx-auto">
      <div className="h-screen w-full dark:bg-black bg-white  dark:bg-dot-white/[0.2] bg-dot-black/[0.2] relative flex items-center justify-center">
        <div className="flex flex-col gap-20 max-w-5xl">
          <div className="max-w-7xl flex flex-col gap-12 items-start">
            {children}
          </div>
        </div>
      </div>
    </main>
  )
}
